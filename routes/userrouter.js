const express = require("express")
const router = express.Router();


router.get("/register",(req,res)=>{
    res.render("register",{
      validationErrors:[],
    formData:req.body
    })
  })
  router.get("/",(req,res)=>{
    res.render("login",{
      email:[]
    })
  })
  

module.exports = router;