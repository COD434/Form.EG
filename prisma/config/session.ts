import dotenv from "dotenv";
import crypto from"crypto";
import {setupRedis} from "./redis"
import type {SessionOptions} from "express-session";

dotenv.config()

interface SessionConfig extends SessionOptions{
store:any;
secret:string;
resave:boolean;
saveUninitialized:boolean;
cookie:{	
secure:boolean;
httpOnly: boolean;
sameSite: boolean | "strict" | "lax" | "none";
maxAge: number;
};
}


const validateSessionSecret = (key: string) => {
  if (!key || typeof key !== "string") {
    throw new Error("SESSION_SECRET environment variable is required and must be a string");
  }
  if (key.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long");
  }
};
const generateRandomSecret = (): string => {
return crypto.randomBytes(32).toString("hex")
};

export const getSessionConfig = async (): Promise<SessionConfig> => {
	const {redisStore } = await setupRedis();

  const sessionKey = process.env.SESSION_SECRET || generateRandomSecret();
  validateSessionSecret( sessionKey);
  
  //const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

  return {
    store: redisStore,
    secret: sessionKey,
    resave: false,
    name:"session_id",
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000
    }
  };
};

export  type{ SessionConfig };
