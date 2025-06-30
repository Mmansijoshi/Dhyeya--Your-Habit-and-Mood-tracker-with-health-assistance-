// server.cjs
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------
// 1. CONNECT TO MONGODB
// ---------------------------
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/yourDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("🔴 MongoDB connection error:", err);
    process.exit(1);
  });

// ---------------------------
// 2. DEFINE MONGOOSE USER MODEL
// ---------------------------
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ---------------------------
// 3. MIDDLEWARE
// ---------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (stores session cookie, signed with SESSION_SECRET)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_session_secret",
    resave: false,
    saveUninitialized: false,
    // If you deploy over HTTPS, set cookie: { secure: true }
    cookie: { secure: false },
  })
);

// Initialize Passport and restore session (if any)
app.use(passport.initialize());
app.use(passport.session());

// ---------------------------
// 4. CONFIGURE PASSPORT + GOOGLE STRATEGY
// ---------------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Look up existing user
        let existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        // If not found, create a new one
        const newUser = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
        });
        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});

// ---------------------------
// 5. SERVE STATIC FILES
// ---------------------------
// If you have a `public/` folder with an HTML login button linking to /auth/google,
// serve it here. For example, public/index.html might have a "Login with Google" link.
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------
// 6. AUTH ROUTES
// ---------------------------

// Home route (optional; can show a button/link to Google login)
app.get("/", (req, res) => {
  res.send(`
    <h1>Home</h1>
    <p><a href="/auth/google">Login with Google</a></p>
  `);
});

// Trigger Google OAuth flow
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth callback URL
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    // On success, redirect to profile or dashboard
    res.redirect("/profile");
  }
);

// Profile route (protected; only accessible if authenticated)
app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <h1>Welcome, ${req.user.email}!</h1>
      <p>Your Google ID: ${req.user.googleId}</p>
      <p><a href="/logout">Log out</a></p>
    `);
  } else {
    res.redirect("/");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// ---------------------------
// 7. START SERVER
// ---------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
