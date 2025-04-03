require("dotenv").config();
const crypto = require("crypto")
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    pool:true,
    port:587,
    secure:false,
    auth:{
        user:process.env.GMAIL_USER,
        pass:process.env.GMAIL_APP_PASSWORD
    }
})

const Token = ()=>{
    return crypto.randomBytes(32).toString("hex")
}


const sendVerification = async (email, token)=>{
    const verifictaionUrl = `${process.env.BASE_URL}/verify-email?token=${token}`
const mailOptions={
    from:` "Karabo" <${process.env.GMAIL_USER}>`,
    to:"seeisakarabo1@gmail.com",
    subject: "Please verify your email address",
    html:`
    <div style = "font-family: Arial,sans-serif;max-width: 600px; margin:0 auto">
    <h2 style="color:#333;">Welcome to our App!<h2>
    <p> Thank you for registering. please verify your email address to complete your registration.Please verify your email address to complete you registration.<p>
    <a href="${verifictaionUrl}"
    style=""display: inline-block; padding: 10px 20px; background color:#4CAF50;color:white; text-direction:none; border-radius:5px;">
    Verify Email</a>
    <p>Or copy htis link to your browser:<p>
    < style="word-break: break-all;">${verifictaionUrl}</p>
    <p>If you didnt create an account with us,please ignore this email.</p>
    </div>`
};
try{
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent  to ${email}`)
}catch(error){
    console.error("Error sending verification email:",error);
    throw new Error("Failed to send verification email");
}
}
module.exports={
    Token,
    sendVerification
}