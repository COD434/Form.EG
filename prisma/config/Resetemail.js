require("dotenv").config();
const nodemailer = require("nodemailer"); 

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	pool: true,
	port:587,
	secure : false,
	auth:{
		user: process.env.RESET_EMAIL_USER,
		pass:process.env.RESET_EMAIL_PASS
	
}
})
const genOTP =()=>{
	return Math.floor(10000 + Math.random() * 900000).toString();
}


const  SendResetPasswordOTP = async (email , otp)=>{
	const mailOptions={
		from:`"Karabo"${process.env.RESET_EMAIL_USER}`,
		to:email,
		subject:"Password Reset OTP",
		html:`<div style="font-style:Arial,sans-serif;
		max-width:600px;margin: 0 auto;">

		<h1 style="color: #333;">Password Reset request</h1>

		<p>Your password reset OTP is: ${otp}.this OPT will expire in 10minutes.</p>
		<div style="background: #f4f4f4; padding: 20px; text-align: center; margin:20px 0;">
		<h1 style="margin: 0; color: #0066cc;">${otp}</h1>
		</div>
		<p>This OTP will expire in 10 minutes.</p>
		<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
		<p style ="font-style: 12px; color: #777; ">This is an automated message,please do not reply.</p>
		</div>
		`
	};
	try{
		await transporter.sendMail(mailOptions);
		console.log(`${otp} was sent to ${email}`)
	}catch(err){
			console.error("Couldnt send email sorry:",err)
			throw  new Error("try again later")
		}
}
	
module.exports={

SendResetPasswordOTP,
	genOTP
}



