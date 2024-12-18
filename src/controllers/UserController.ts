import express from "express";
import {
  hashPassword,
  comparePassword,
  generateEmailVerificationToken,
} from "../utils/cryptoUtils";
import {
  changeUserPassword,
  userFoundInDatabase,
  saveUserInDatabase,
  getUserFromDatabase,
  saveEmailVerificationTokenToDatabase,
  getEmailVerificationTokenFromDatabase,
  updateUserEmailVerificationStatus,
} from "../models/userModel";
import { User } from "../types/User";
import path from "path";
import isAuthenticated from "../utils/authMiddleware";
import bcrypt from "bcrypt";
import { type } from "os";

const router = express.Router();

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (userFoundInDatabase(username)) {
    return res.status(400).send("Username already exists");
  }

  hashPassword(password, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send("Error hashing password");
    }

    const newUser = new User(username, email, hashedPassword, false);
    saveUserInDatabase(newUser);

    const token = generateEmailVerificationToken();
    const expirationTime: number = Date.now() + 60 * 60 * 1000; // 1 hour

    saveEmailVerificationTokenToDatabase(username, token, expirationTime);

    res.status(201).send(`
      <h1>Registration Successful</h1>
      <p>Welcome, ${username}. Please check your <a href="/email?username=${username}">email</a> to verify your account.</p>
    `);
  });
});

router.get("/session", (req, res) => {
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
  console.log("logging out");
  res.clearCookie("token");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error during logout");
    }

    res.redirect("/");
  });
});

router.get("/change-password", isAuthenticated, (req, res) => {
  const user = req.session.user?.username;

  if (user === undefined) {
    res.send(`<h1>User session not found. Back to <a href="/">home</a></h1>`);
  }

  res.sendFile(path.join(__dirname, "../views", "change-password.html"));
});

router.post("/change-password", isAuthenticated, (req, res) => {
  const {
    "old-password": oldPassword,
    "new-password": newPassword,
    "confirm-password": confirmPassword,
  } = req.body;

  const user = req.session.user?.username;
  console.log("got user from session:", user);

  // Fetch the user record from the database
  const userRecord = getUserFromDatabase(user);
  console.log("user record:", userRecord);

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    return res.status(400).send("Passwords do not match");
  }

  // Check if the user exists
  if (!userFoundInDatabase(user)) {
    return res.status(400).send("User not found");
  }

  // Check if the old password matches the current one
  comparePassword(
    oldPassword,
    userRecord?.password as string,
    (err, isMatch) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error comparing password");
      }

      if (!isMatch) {
        return res.status(400).send("Incorrect password");
      }

      // Hash the new password
      hashPassword(newPassword, (err, hashedPassword) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Error hashing password");
        }

        // Update the password in the database
        if (changeUserPassword(user, hashedPassword)) {
          return res.send(`
          <h1>Password changed successfully</h1>
          <p>Back to <a href="/dashboard">dashboard</a></p>
        `);
        } else {
          return res.status(500).send("Error updating password in database");
        }
      });
    }
  );
});

export default router;
