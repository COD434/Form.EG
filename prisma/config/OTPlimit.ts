import dotenv from "dotenv";
import Redis,{Redis as RedisClient}  from "ioredis"
import {RateLimiterRedis ,RateLimiterMemory} from "rate-limiter-flexible";
import {setupRedis} from "./redis"
import {Request, Response, NextFunction} from "express"
dotenv.config()

class TokenBucket{
private redis: RedisClient


constructor(redisClient:RedisClient){
this.redis = redisClient;
}

async consume(key:string, capacity:number, refillRate:number): Promise<{
allowed:boolean;
remaining:number;
retryAfter?:number;
}>{
const now = Date.now();
const results = await this.redis
.pipeline()
.hgetall(`rate_limit:${key}`)
.exec();
const bucket = results[0][1] as {tokens?: string;lastRefill?: string}
|| {} ;
const currentToken = parseFloat(bucket.tokens || capacity.toString ());
const lastRefill = parseFloat(bucket.lastRefill || now.toString())
const timeElapsed= (now - lastRefill) / 1000;
const newToken =  Math.min(capacity,  currentToken + (timeElapsed * refillRate))

if (newToken < 1){
return{
allowed:false,
remaining:Math.floor(newToken),
retryAfter:Math.ceil((1 - newToken) / refillRate)
}
}
await this.redis.hset(`rate_limit:${key}`,{
tokens:(newToken - 1).toString(),
lastRefill: now.toString()
})
return {allowed:true ,remaining:Math.floor(newToken - 1)};
 }
}
let tokenBucket: TokenBucket;


//in//terface RateLimiterConfig{
//	 keyPrefix:string;
//	 duration:number;
//	 points:number;
//	 blockDuration:number;
//	 inMemoryBlockOnConsumed:number;
//	 keyGenerator:(req: Request) => string
 //}
//i/nterface RateLimitSessionData{
//	retryAfter:number;
//	message:string;
//}
//
//const redisClientPromise = setupRedis();
//let redisClient:RedisClient | null = null;
//let otpLimiter: RateLimiterRedis | null = null;
//let loginLimiter: RateLimiterRedis | null = null
//redisClientPromise.then(({redisClient: client })=>{
//r/edisClient = client;
///}).catch(err => console.error("Redis setup error",err))

//const initializeRateLimiters = async () => {
  //try {
    //redisClient = (await setupRedis()).redisClient;
    ///otpLimiter = await setupRateLimiter(RATE_LIMIT_CONFIGS.OTP);
    //loginLimiter = await setupRateLimiter(RATE_LIMIT_CONFIGS.LOGIN);
  //} catch (err) {
  //  console.error("Redis setup error:", err);
    //throw new Error("Failed to initialize rate limiters");
  //}
//}
export const initializeRateLimiter = async () => {
const redisClient = (await setupRedis()).redisClient;
tokenBucket = new TokenBucket(redisClient);
};
const createRatelimiter = (config:{
capacity:number;
refillRate: number;
keyGenerator:(req:Request)=> string;
})=>{
return async(req:Request, res:Response, next:NextFunction): Promise<void> =>{
const key = config.keyGenerator(req);
const {allowed, remaining, retryAfter}= await tokenBucket.consume(
key,
config.capacity,
config.refillRate
);
res.set({
"X-RateLimit-Limit": config.capacity.toString(),
"X-RateLimit-Remaining":remaining.toString(),
...(!allowed && {"Retry-After": retryAfter?.toString() || "1"})
})
 allowed ? next() : res.status(429).json({
error:`Too many requests. Try again in ${retryAfter}s`
  })
 }
}

//const setupRateLimiter = async (config: RateLimiterConfig):Promise<RateLimiterRedis> =>{
//if (!redisClient){
//throw new Error("Redis clients not initialized")
//}i
//c/onsole.log(`Setting up rate limiter for ${config.keyPrefix}`)
//return new RateLimiterRedis({
//storeClient: redisClient,
//keyPrefix:config.keyPrefix,
//sendCommand:async (...args: string[])=> redisClient.call(...args),
//blockDuration: config.blockDuration,
//p/oints: config.points,
//duration:config.duration,
//inMemoryBlockOnConsumed:config.inMemoryBlockOnConsumed,
//}///)
//}

//const rateLimiterMiddleware = (limiter: RateLimiterRedis | null, config: RateLimiterConfig) =>
  //async (req: Request, res: Response, next: NextFunction) => {
    //if (!limiter) {
     // console.error("Rate limiter not initialized");
  //    return next(new Error("Rate limiter not ready"));
   // }

    
      //const key = config.keyGenerator(req);
      //if (!key || key.endsWith("_")) {
        //console.error("Invalid rate limit key generated:", key);
        // return next(new Error("Invalid request key"));
      //}
    //try{  console.log(`Rate limiting key: ${key}`);
      //await limiter.consume(key); 
      //next();
    //} catch (err: any) {
      //const msBeforeNext = err.msBeforeNext ?? 0;
      ///const retryAfter = msBeforeNext > 0 ? Math.ceil(msBeforeNext / 1000) : 60;
      //console.error(`Rate limit exceeded for key ${config.keyPrefix}:${key}`);
    //  const error = new Error(`Too many request! Try again in ${retryAfter} seconds`)
      //const error = 429;
     // return next();
   // }
 // };
const RATE_LIMIT_CONFIGS= {
	OTP:{
	keyPrefix:"otp_limiter",
	refillRate: 0.1,
	capacity:3,
	keyGenerator: (req:Request)=>{
		const email =req.body?.email;
		if(!email) return ""
			return `${req.ip}_${email}`
}
	},


	LOGIN:{
	keyPrefix:"login_limiter",
        capacity:10,
        refillRate:2,
	keyGenerator:(req: Request) => req.ip || "unknown"
	}
};

//let otpLimiter: RateLimiterRedis
//let loginLimiter:RateLimiterRedis
initializeRateLimiter().catch((err) => {
  console.error("Failed to initialize rate limiters:", err);
  process.exit(1);
})

//(async()=>{
//const{redisClient: client} = await setupRedis();
//redisClient = client;
//otpLimiter = await setupRateLimiter(RATE_LIMIT_CONFIGS.OTP);
//loginLimiter = await setupRateLimiter(RATE_LIMIT_CONFIGS.LOGIN);
//})();

export const OTPLimiterMiddleware = () =>createRatelimiter(RATE_LIMIT_CONFIGS.OTP);
export const LoginLimiterMiddleware = () => createRatelimiter(RATE_LIMIT_CONFIGS.LOGIN);
