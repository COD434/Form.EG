const express = require("express")
const router = express.Router();
const adminController = require ("../Controllers/whitelistController");
const{dynamicWhitelist,csrfProtection}= require("../prisma/config/security")
const {sendOTP}= require("../prisma/config/otp")
const {randomInt} = require("crypto");
const csrf =require ("csurf");
const cookieParser = require('cookie-parser');


router.use(cookieParser());

router.get("/register",csrfProtection,(req,res)=>{
res.render("register",{
csrfToken:req.csrfToken(),
validationErrors:[],
formData:req.body
    })
  })
router.get("/",csrfProtection,(req,res)=>{
res.render("login",{
csrfToken:req.csrfToken(),
email:[],
message:[]
    })
  })
router.get("/reset-password-otp",csrfProtection,(req,res)=>{
res.render("reset-password-otp",{
csrfToken:req.csrfToken(),
error:[],
success:"Whoohoo! All done",
email:[]
    })
  })
router.get("/forgotPass",csrfProtection,(req,res)=>{
res.render("forgotPass",{
csrfToken:req.csrfToken()
    })
    })
router.get("/update-password",csrfProtection,(req,res)=>{
res.render("update-password",{
csrfToken:req.csrfToken()
})
})
router.get("/waitSceen",csrfProtection,(req,res)=>{
res.render("waitSceen",{
csrfToken:req.csrfToken(),	
rateLimit:req.session.rateLimit,
message:[]
})
})

  router.post("/whitelist/add",csrfProtection,adminController.addIP);
  router.post("/whitelist/remove",csrfProtection,adminController.removeIP);
  router.get("/whitelist/list",adminController.listIP)
  

module.exports = router
	        
