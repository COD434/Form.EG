//import {PrismaClient} from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import {prisma} from "./validate";
dotenv.config();




export const seedAdmin = async () =>{
const existingAdmin = await prisma.user.findFirst({
where:{
role:"ADMIN"
 }
})
if(!existingAdmin){
const hashedPassword = await bcrypt.hash(process.env.PASS!,10)
const admin = await prisma.user.create({
data:{
email:process.env.ADMIN_EMAIL!,
username:process.env.ADMIN_USERNAME!,
password:hashedPassword,
role:"ADMIN",
isVerified:true,
}
});
console.log("Admin user created:",admin.email);
}else{
console.log("Admin user already exists:",existingAdmin.email)
 }
}

