const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const setupSecurity = () => {
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 4,
    message: "Too many login attempts"
  });

  const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'", "data"],
    fontSrc: ["'self'", "trusted-fonts.com"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  };

  return {
    helmetConfig: [
      helmet.hsts({
        maxAge: 315353444,
        includeSubDomains: true,
        preload: true,
      }),
      helmet.contentSecurityPolicy({
        directives: cspDirectives
      })
    ],
    loginLimiter
  };
};

module.exports = { setupSecurity };