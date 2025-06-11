import {Request, Response} from "express"
import { validateAndRefreshToken} from "./Rvalidation"


export const refreshTokenController = async (req:Request ,res: Response)=>{
try{

	const {refreshToken} = req.body;

	const newAccessToken = await validateAndRefreshToken(refreshToken)

res.json({accessToken:newAccessToken});
}catch(err:any){

	const status = err.message === "Missing token" ? 401 : 403

	res.status(status).json({message:err.message})
 }
}
