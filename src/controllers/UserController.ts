import express from "express";
import {
  hashPassword,
  comparePassword,
  generateEmailVerificationToken,
  hashPassword_promise,
} from "../utils/cryptoUtils";
import {
  changeUserPassword,
  userFoundInDatabase,
  saveUserInDatabase,
  getUserFromDatabase,
  saveEmailVerificationTokenToDatabase,
} from "../models/userModel";
import { User } from "../types/User";
import path from "path";
import isAuthenticated from "../utils/authMiddleware";
import { TOKEN_EXPIRATION_IN_MIN } from "../config.ts";

const router = express.Router();

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (userFoundInDatabase(username)) {
    return res
      .status(400)
      .send(`<p>Username already exists. Back to <a href="/">home</a>.</p>`);
  }

  hashPassword(password, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send("Error hashing password");
    }

    const newUser = new User(username, email, hashedPassword, false);
    saveUserInDatabase(newUser);

    const token = generateEmailVerificationToken();
    const expirationTime: number =
      Date.now() + TOKEN_EXPIRATION_IN_MIN * 60 * 1000; // 1 hour

    saveEmailVerificationTokenToDatabase(username, token, expirationTime);

    res.status(201).send(`
      <h1>Registration Successful</h1>
      <p>Welcome, ${username}. Please check your <a href="/email?username=${username}">email</a> to verify your account.</p>
    `);
  });
});

router.get("/session", (req, res) => {
  console.log(req.sessionID);
  return res.send("hello " + req.session.user);
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "login.html"));
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const userRecord = getUserFromDatabase(username);
  if (userRecord) {
    comparePassword(password, userRecord.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send("Error comparing password");
      }

      if (!isMatch) {
        return res.status(400).send(`
        <h1>Invalid Credentials</h1>
        <p>The username or password you entered is incorrect. Back to <a href="/">home.</a></p>
      `);
      }

      // If password matches, check if email is verified
      if (!userRecord.isValidated) {
        return res.status(400).send(`
        <h1>Email Not Verified</h1>
        <p>Your email is not verified yet. Please check your  <a href="/email?username=${username}">inbox</a> for the verification link.</p>
      `);
      }
      req.session.user = {
        username: userRecord.username,
        email: userRecord.email,
      };
      res.redirect("/dashboard");
    });
  }
});

router.get("/dashboard", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "dashboard.html"));
});

router.get("/logout", isAuthenticated, (req, res) => {
  res.clearCookie("token");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error during logout");
    }

    res.redirect("/");
  });
});

router.get("/change-password", isAuthenticated, async (req, res) => {
  const user = req.session.user?.username;

  if (user === undefined) {
    res.send(`<h1>User session not found. Back to <a href="/">home</a></h1>`);
  }

  res.sendFile(path.join(__dirname, "../views", "change-password.html"));
});

router.post("/change-password", isAuthenticated, async (req, res) => {
  const {
    "old-password": oldPassword,
    "new-password": newPassword,
    "confirm-password": confirmPassword,
  } = req.body;

  const username = req.session.user?.username;

  // Fetch the user record from the database
  const userRecord = getUserFromDatabase(username);
  const userRecordPassword = userRecord?.password;

  // Check if new passwords match
  if (newPassword !== confirmPassword) {
    return res.status(400).send("Passwords do not match");
  }

  // check if old password entered matches hashed password
  comparePassword(
    oldPassword,
    userRecordPassword as string,
    async (err, isMatch) => {
      if (isMatch) {
        const hashedPassword = await hashPassword_promise(confirmPassword);

        const result = await changeUserPassword(username, hashedPassword);
        if (result) {
          res.send(`
      <h1>Password changed successfully</h1>
      <p>Back to <a href="/dashboard">dashboard</a></p>
    `);
        }
      } else {
        res.status(400).send(`
          Your password is incorrect
        `);
      }
    }
  );
});

export default router;
