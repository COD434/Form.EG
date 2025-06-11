import dotenv from "dotenv";
import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import {setupRedis} from "./redis"
dotenv.config();

interface JwtPayload {
userId: string;
email: string;
}

const redisClientPromise = setupRedis();
let redisClient:any;
redisClientPromise.then(({redisClient: client}) =>{
redisClient = client;
}).catch (err => console.error("Redis setup error",err));

export const authenticateJWT = async(req:Request, res:Response, next:NextFunction): Promise<void> =>{


	const authHeader = req.headers.authorization;

	const token = req.cookies?.token ||(authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

if (!token){
 res.status(401).json({message: "Unauthorized"})
return;
}
try{

	const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
	const storedToken = await redisClient.get(`session:${decoded.userId}`);
	if(storedToken !== token){
res.status(403).json({success:false, message: "Invalid session", errors:[]})
return
}
(req as any).user = decoded;
return next()

}catch(err){
res.status(403).json({success: false ,message: "Invalid  or expired token"})
return;
};
}

