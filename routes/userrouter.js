const express = require("express")
const router = express.Router();
const adminController = require ("../Controllers/whitelistController");
const{dynamicWhitelist}= require("../prisma/config/security")

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
  router.post("/whitelist/add",adminController.addIP);
  router.post("/whitelist/remove",adminController.removeIP);
  router.get("/whitelist/list",adminController.listIP)
  

module.exports = router;