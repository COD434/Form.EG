const express = require("express")
const app = express();
const {PrismaClient}= require("@prisma/client")
const prisma = new PrismaClient();

app.set(express.urlencoded,({extended: true}))
app.use(express.json())

const createUser= async(req,res)=>{    
  const {email} = req.body
  console.log("req.body:",req.body)

  if(!email){
    res.status(400).json({error:"Email is required"})
  }
       const user= await prisma.user.create({
          data: {
           email
          
            
          }
          
        })
          res.status(200).render("login")
     
}
   

const Login= async(req,res)=>{
    const {email}=req.body;
    const user= await prisma.user.findFirst({
      where:{
        email
       
       
      }
      
  })
    if(!email){
      res.status(404).render("sorry404")
    }else{
      res.status(200).render("dashboard")
    }

}
const renderForm = (req,res)=>{
  res.render("login");
  }
  module.exports={
    Login,
    createUser,
    renderForm
  }