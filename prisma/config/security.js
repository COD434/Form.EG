const express = require("express")
const app = express()
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const {redisClient} =require ("./redis")

const dynamicWhiteList={
  isAllowed:async (ip)=>{
    try{
      const result = await redisClient.sIsMember("ip-whitelist",ip);
      return result || ip === "::1" || ip === "127.0.0.1";
    }catch(err){
      console.error("Redis whitelist check failed:",err);
      return false;
    }
  },
  addIP:async (ip)=>{
    await redisClient.sAdd("ip-whitelist",ip)
  },
  removeIP:async(ip)=>{
    await redisClient.sRem("ip-whitelist",ip)
  },
  getAll: async()=>{
    return await redisClient.sMembers("ip-whitelist")
  },
  middleware: ()=>{
    return async (req,res,next)=>{
      const clientIP= req.headers["x-forward-for"]?.split(",")[0]?.trim()
      || req.ip || req.connection.remoteAddress;

      if(await dynamicWhiteList.isAllowed(clientIP)){
        return next();
      }
      console.warn(`Blocked request from IP: ${clientIP}`);
      res.status(403).json({error:"Access denied"})
    };
  }
};
const setupSecurity = () => {
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 6,
    message: "Too many login attempts from this IP,please try again later",
    standardHeaders:true,
    legacyHeaders:false,
    skipSuccessfulRequests:true
  });

  const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'","'unsafe-inline'"],
    imgSrc: ["'self'", "data:","trusted-cdn.com"],
    fontSrc: ["'self'", "trusted-fonts.com"],
    connectSrc: ["'self'","api.trusted-domain.com"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
    reportUri:"/csp-violention-report"
  };

  const securityHeaders= [
      helmet.hsts({
        maxAge: 315353444,
        includeSubDomains: true,
        preload: true,
      }),
      helmet.contentSecurityPolicy({
        directives: cspDirectives,
        reportOnly:process.env.NODE_ENV !== "production"
      }),
      helmet.xssFilter(),
      helmet.noSniff(),
      helmet.frameguard({action:"deny"}),
      helmet.referrerPolicy({policy:"same-origin"}),
     
      
    ];

  
app.use(securityHeaders)
  
return{
    loginLimiter,
    dynamicWhiteList
  };
};

module.exports = { setupSecurity,dynamicWhiteList };