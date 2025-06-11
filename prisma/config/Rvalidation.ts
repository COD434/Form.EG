import jwt from "jsonwebtoken";
import {initializeRedisClient} from "./redis"

interface TokenPayload{
userId: string;
email: string;
}

let redisClient: any
export const validateAndRefreshToken = async(refreshToken:string)=>{
if (!refreshToken){
throw new Error("Missing token")
}
const decoded= jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as TokenPayload

const redisClient = await initializeRedisClient();
const storedToken = await redisClient.get(`refresh:${decoded.userId}`)
if(storedToken !== refreshToken){
throw new Error("Invalid refersh token")
}
const newAccessToken = jwt.sign({
userId: decoded.userId, email: decoded.email},
			       process.env.JWT_SECRET!,
			       {expiresIn: "15m"}
			       )
			       return newAccessToken;
}
