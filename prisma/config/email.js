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
    to: email,
    subject: "Please verify your email address",
    html:`
    <div style = "font-family: Arial,sans-serif;max-width: 600px; margin:0 auto">
    <h1>I LOVE YOU
    
    <p> YOU ARE THE BEST NEVER FORGET THAT</p>
    <p>PS CONGRATS ON REACHING R12K TODAY!<p>
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