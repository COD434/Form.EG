const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const { Token, sendVerification } = require("../prisma/config/email");
const { prisma } = require("../prisma/config/validate");
const {SendResetPasswordOTP,genOTP} = require("../prisma/config/Resetemail");
const {otpLimiter}= require("../prisma/config/security");

const requestPassword = async(req, res,next)=>{
  const{email}= req.body;

try{
  const user = await prisma.user.findFirst({where:{email}
  
  
  })
  if(!user){
    return res.status(400).render("login",{
      error:"No account found with that Number was found"
    })
  }
  const resetToken =genOTP();
  const resetExpires= new Date(Date.now() + 10 * 60 * 1000)

  await prisma.user.update({
    where:{email},
    data:{
      resetToken,
      resetExpires
    }
  });
  await SendResetPasswordOTP(email, resetToken)

  return res.render("reset-password-otp",{
    email,
   error:"",
    success:"Password reset OTP has been sent to you email"
  })
  
}catch(err){
  console.error("password reset error:",err);
  return res.status(500).json({
    error:"Error sending password reset OTP. Please try again."
  });
}
}

const verifyResetOTP = async (req,res)=>{
const{email, otp}= req.body;
  try{
    const user = await prisma.user.findUnique({
      where:{
        email,
        resetToken:otp,
        resetExpires:{gt:new Date()}
      }
    })
    if(!user){
      return res.render("reset-password-otp",{
        email,
	success:"",
        error:"Invalid or expired OTP.Please try again."
      })
	    }
    return res.redirect(200,"/update-password",{
      email,
      otp,
      error:"",
      success:"OTP verified. please enter your new password."
    })
  }catch(err){
    console.error("OTP verification error:",err);
    return res.redirect(400,"/reset-password-otp",{
      email,
     success:"",	    
      error: "Error verifying OTP .please try again"
    })
  }
}

const UpdatePassword = async(req,res)=>{
  const {email,password,otp}=req.body;
	const hashed = await bcrypt.hash(password,10)
  try{
    const user = await prisma.user.findFirst({
      where:{
        email,
        resetToken:otp,
        resetExpires:{gt: new Date()}
      }
    })
    if(!user){
      return res.render("update-password",{
        email,
        otp,
	      success:"",
        error:"Invalid or expired OTP.Please request a new one."
      })
    }

    await prisma.user.update({
      where:{email},
      data:{
        password:hashed,
        resetToken:null,
        resetExpires:null
        }
    })
    return res.render("login",{
      successMessage:"Password updated successfully.Please login with tou new password"
    })
  }catch(err){
    console.error("Password update error:",err);
    return res.render("update-password",{
      email,
      otp,
success:"",
      error:"error updating password.Please try again"
    })
  }
}


const registerValidations = [
  body("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        throw new Error("User with that email already exists, want to login?");
      }
      return true;
    }),
  body("username")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Username is required"),
  body("password")
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    })
    .withMessage("Password must include at least one lowercase, uppercase, number and symbol")
    .trim()
    .escape()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
	
];

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("register", {
      validationErrors: errors.array(),
      FormData: req.body
    });
  }

  try {
    const { email, password, username } = req.body;
    const verifyToken = Token();
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    const login = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        isVerified: false,
        verifyToken,
        verifyExpires
      }
    });

    await sendVerification(email, verifyToken);
    
    if (login) {
      res.status(200).render("login", {
        successMessage: "Registration successful! Please check your email to verify your account."
      });
    }
  } catch (err) {
    console.error("Registration error:", err);
    return res.render("register", {
      validationErrors: [{ msg: "Registration failed. Please try again" }],
      formData: req.body
    });
  }
};

const loginValidations = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email").bail(),
  body("password").trim().bail().notEmpty().withMessage("Password is required"),
body("username").optional().isLength({min: 5}).withMessage("Username must have atleast 5 characters"),
  
(req,res,next)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({
        success:false,
        errors:errors.array()
      })
    }
    next()
  }
];

const login = async (req, res) => {
  const { email, password,username } = req.body;
  
  try {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(400).render("login", { errors:[{param: "email",
    msg:" Email not Found. Want to register?",
  }],
  values:{email,username} 
});
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).render("login", { errors: [{param:" password",
    msg:"Incorrect password.Please try again",
  value:""}],

values:{email,username}})
     
    }

    res.render("dashBoard");
  } catch (err) {
    res.status(400).render("login", { message: "Invalid email or password" }),
    email
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).render("error", {
      message: "Invalid verification link"
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).render("sorry404", {
        message: "Invalid or expired verification link"
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyExpires: null
      }
    });

    return res.render("verification-success");
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).render("sorry404", {
      message: "Email verification failed"
    });
  }
};

module.exports = {
  registerValidations,
  register,
  loginValidations,
  login,
  verifyEmail,
  verifyResetOTP,
  requestPassword,
  UpdatePassword
};
