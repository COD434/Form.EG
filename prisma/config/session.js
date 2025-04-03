const crypto = require("crypto");

const validateSessionSecret = (key) => {
  if (!key || typeof key !== "string") {
    throw new Error("SESSION_SECRET environment variable is required and must be a string");
  }
  if (key.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long");
  }
};

const getSessionConfig = (redisStore) => {
  const sessionKey = process.env.SESSION_SECRET || crypto.randomBytes(34).toString("hex");
  validateSessionSecret(sessionKey);
  
  const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

  return {
    store: redisStore,
    secret: sessionKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      expires: expiryDate,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000
    }
  };
};

module.exports = { getSessionConfig };