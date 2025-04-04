require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const  setupRedis  = require("./prisma/config/redis");
const { getSessionConfig } = require("./prisma/config/session");
const { connectDB } = require("./prisma/config/validate");
const { setupSecurity } = require("./prisma/config/security");
const { initializePassport } = require("./Controllers/passportController");
const authController = require("./Controllers/authController");
const shopRouter = require("./routes/userrouter");

const app = express();

// Database connection
connectDB();

// View engine setup
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "styles")));

// Redis and session setup
(async () => {
  try{const { redisStore } = await setupRedis();
  const sessionConfig = getSessionConfig(redisStore);
  app.use(session(sessionConfig));
}catch(err){
  console.error("failed to setup Redis");
  process.exit(1)
}
  
  // Passport initialization
  initializePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // Security middleware
  const {  loginLimiter } = setupSecurity(app);


  // Routes
  app.use("/", shopRouter);
  
  // Auth routes
  app.post("/register", authController.registerValidations, authController.register);
  app.post("/login", loginLimiter, authController.loginValidations, authController.login);
  app.get("/verify-email", authController.verifyEmail);

  // Error handling
  app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).render("sorry404", { message: "Something went wrong" });
  });

  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();