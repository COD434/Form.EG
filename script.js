require("dotenv").config();
const path = require("path")
const {Token, sendVerification} = require("./views/emailfunc/emailSender")
const crypto = require("crypto")
const {PrismaClient}= require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const app = express();
const Redis=("redis")
const session = require("express-session");
const shopRouter =require("./routes/userrouter");
const passport= require("passport");
const bcrypt = require("bcrypt")
const LocalStrategy = require("passport-local");
const {body, validationResult} = require("express-validator");
const helmet = require("helmet")
const rateLimit =require("express-rate-limit");
const {createClient}= require("redis")
//const csrf= require("csurf");
//const csrfProtection=csrf({cookie:true});
const { RedisStore } = require("connect-redis");
const { nodeModuleNameResolver } = require("typescript");
const redisClient = createClient({
url: process.env.REDIS_URL,
password:process.env.REDIS_PASSWORD

})


const validateRedisUrl=(url)=>{
  if(!url || typeof url !== "string"){
throw new Error("REDIS_URL envoronment variable is required")
  }
  if (!url.startsWith("redis://")){
    throw new Error("REDIS_URL must use the 'redis://'protocol for secure connections")
  }
}
validateRedisUrl(process.env.REDIS_URL)
const redisStore = new RedisStore({
  client: redisClient,
  prefix:"mycommerce:session",
  ttl:60*60,
}) 
redisClient.on("error",(err)=>{
  console.error("Redis client Error:",err)
})
redisClient.connect().catch(console.error)


//
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//app.set("views", path.join(__dirname,"views"))
 

const validationSessionSecret=(Key)=>{
  if(!Key || typeof  Key!=="string"){
  throw new Error("SESSION_SECRET environment variable is required and must be a string")
  }
  if(Key.length < 32){
    throw new Error("SESSION_SECRET must be at least 32 characters long");
  }
}
const sessionKey = process.env.SESSION_SECRET || crypto.randomBytes(34).toString("hex");
validationSessionSecret(sessionKey)

//const usertoken = crypto.randomBytes(34).toString("hex")

const expiryDate = new Date(Date.now()+ 60* 60* 1000)

app.use(session({
  store:redisStore,
  secret: sessionKey,
  resave: false,//Never change
  saveUninitialized:false,//Never change
cookie:{secure:process.env.NODE_ENV ==="production"
,expires:expiryDate,
httpOnly:true,
sameSite:"strict"
,maxAge:60 * 60 * 1000},
}))


app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname,"styles")))
app.use("/",shopRouter)


app.use(helmet.hsts({
  maxAge:315353444,
  includeSubDomains:true,
  preload:true,
}));

const cspDirectives=process.env.DIRECTIVES
  
app.use(helmet.contentSecurityPolicy({
  directives:{
    defaultSrc:["'self'"],
  scriptSrc:["'self'"],
  styleSrc:["'self'"],
  imgSrc:["'self'","data"],
  fontSrc:["'self'","trusted-fonts.com"],
  connectSrc:["'self'"],
  frameSrc:["'none'"],
  objectSrc:["'none'"],
  upgradeInsecureRequests:[]
}
    || cspDirectives
})
)
const loginLimiter = rateLimit({
  windowMs:15 * 60 * 1000,
  max:3,
  message:"Too many login attempts"
})

const sessionSecret = process.env.SESSION_SECRET;
if(!sessionSecret){
  throw new Error("SESSION_SECRET environment variable is required")
}
prisma.$connect().then(()=>console.log("connected to database"))
.catch((err)=> console.error("Database connection error:",err))
  
 
  
  







passport.use(
  new LocalStrategy(
    async(email, password, done)=>{
      try {
        const user = await prisma.user.findUnique({
         where:{email}
        })
        if(!user){
          return done(null,false,{message:"Incorrect username"});
      }
      const isValidPassword = await bcrypt.compare(password,user.password)
      if(!isValidPassword){
        return done(null, false, {message:"incorrect password"})
      }
      return done(null,user)
      }catch(err){
        return done(err)
      }

    }
  )
)

passport.serializeUser((user,done)=>{
  done(null,user.id)
})

passport.deserializeUser(async(id,done)=>{
try{
  const user = await prisma.user.findUnique({where:{ id}})
  if(!user){
    return done(null,false)
  }
  done(null,user)
}catch(err){
  done(err)
}
})


app.post("/register",[body("email")
.normalizeEmail()//sanitizes email
.isEmail()
.withMessage("Invalid email").
custom(async(email)=>{
  //checks if user exists
  const user = await prisma.user.findUnique({
    where:{email}
  })
  if(user){
    throw new Error("User with that email already exists, want to login?")
  }
  return true;
}),
body("username")
.matches(/^[a-zA-Z0-9_-]+$/)
.trim().escape()//sanitizes username
.notEmpty()
.withMessage("Username is required"),
body("password").isStrongPassword({
  minLength:12,
  minLowercase:1,
  minNumbers:1,
  minSymbols:1,
  minUppercase:1,
}).withMessage("password must include atleast one lowercase,uppercase one number and one symbol")
.trim()
.escape()//sanitizes password
.isLength({min:8})
.withMessage
("Password must be at least 8 characters long")
],
// converts errors to array if not already
async(req,res)=>{
    const errors = validationResult(req)
    const validationErrors = errors.isEmpty() ? [] : errors.array 
    if(!errors.isEmpty()){
     return res.render("register",{
      validationErrors:errors.array(),
      FormData:req.body
     })
    }

  


  try{
    const {email,password,username} = req.body
    const verifyToken = Token();
    const verifyExpires = new Date(Date.now()+24 * 60 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password,10)
    const login= await prisma.user.create({
          data: {
          email,
          username,
         password:hashedPassword,
         isVerified:false,
         verifyToken,
         verifyExpires
        }
        }
          
        )
        await sendVerification(email,verifyToken)
        if(login){
          res.status(200).render("login",{
            successMessage:"Registration successful! please check your email to verify your account."
          })
        }
       console.log(login)
} catch(err){
  console.error("Registration error:",err)
  return res.render("register",{
   validationErrors:[{msg:"registration failed.Please try again"}],
   formData:req.body
  })

}
})


app.post("/login",loginLimiter,[body("email").isEmail().normalizeEmail()
  .withMessage("invalid email"),body("password").trim()
  .escape()
  .notEmpty().
  withMessage("Password is required")]
  ,async(req,res)=>{


  const {email, password}=req.body;
  

//const errors = Result(req)
//    if(!errors.isEmpty()){
//      return res.status(400).render("error",{message:errors.array()[0].msg})
//    }
  try{const user= await prisma.user.findFirst({
    where:{
      email
    }
    })
    if(!user){
      res.status(400).render("error",{message:"Invalid email or password"})
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if(!isValidPassword){
      return res.status(400).render("sorry404",{message:"Invalid email or password"})
    }else{
    res.render("dashboard")}
}catch(err){
  res.status(400).render("error",{message:"Invalid email or password"})
}
})


app.get("/verify-email",async(req,res)=>{
  const {token} = req.query;

  if(!token){
    return res.statusMessage(400).render("error",{
      message:"Invalid verification link"
    })
  }
  try{
    const user = await prisma.user.findFirst({
      where:{
        verifyToken:token,
        verifyExpires:{gt: new Date()}
      }
    })
    if(!user){
      return res.status(400).render("sorry404",{
        message:"Invalid or expired verification link"
      })
    }
    await prisma.user.update({
      where:{id:user.id},
      data:{
        isVerified:true,
        verifyToken:null,
        verifyExpires:null
      }
    })
    return res.render("verification-success")
  }catch(err){
    console.error("error:",err);
    return res.status(500).render("sorry404",{
      message:"Email verification failed"
    })
  }
})

//global error handling
app.use((err,req,res,next)=>{
  console.error("Global error handler:",err)
  res.status(500).render("sorry404",{message:"Something went wrong"})
})
//database error handling

const PORT =process.env.PORT
app.listen(PORT,()=>{console.log(`Port ${PORT} is active`)})