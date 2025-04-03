const { createClient } = require("redis");
const session = require("express-session");
const { RedisStore } = require("connect-redis");

const validateRedisUrl = (url) => {
  if (!url || typeof url !== "string") {
    throw new Error("REDIS_URL environment variable is required");
  }
  if (!url.startsWith("redis://")) {
    throw new Error("REDIS_URL must use the 'redis://' protocol for secure connections");
  }
};

const setupRedis = async () => {
  validateRedisUrl(process.env.REDIS_URL);
  
  const redisClient = createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD
  });

  redisClient.on("error", (err) => {
    console.error("Redis client Error:", err);
  });

  await redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "mycommerce:session",
    ttl: 60 * 60,
  });

  return { redisClient, redisStore };
};

module.exports = setupRedis ;