import express from "express";
import {
  hashPassword,
  comparePassword,
  generateEmailVerificationToken,
} from "../utils/cryptoUtils";
import {
  userFoundInDatabase,
  saveUserInDatabase,
  getUserFromDatabase,
  saveEmailVerificationTokenToDatabase,
  getEmailVerificationTokenFromDatabase,
  updateUserEmailVerificationStatus,
} from "../models/userModel";
import { User } from "../types/User";
import path from "path";

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

router.get("/resend-verification", (req, res) => {
  const { username } = req.query;

  const userRecord = getUserFromDatabase(username as string);
  if (userRecord) {
    const token = generateEmailVerificationToken();
    const expirationTime: number = Date.now() + 60 * 60 * 1000; // 1 hour

    saveEmailVerificationTokenToDatabase(
      userRecord.username,
      token,
      expirationTime
    );

    res.send(`
      <h1>Verification Email Resent</h1>
      <p>Please check your <a href="/email?username=${username}">email</a> to verify your account.</p>
    `);
  } else {
    res.status(404).send(`
      <h1>User Not Found</h1>
      <p>No user found with the username: ${username}</p>
    `);
  }
});

router.get("/email", (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).send("Username is required.");
  }

  const { token, tokenExpiration } = getEmailVerificationTokenFromDatabase(
    username as string
  );
  const verificationLink = `http://localhost:3000/verify-email?user=${username}&token=${token}`;

  res.send(`
    <h1>Email Verification Link</h1>
    <p>Click the link below to verify your email:</p>
    <p><a href="${verificationLink}">${verificationLink}</a></p>
  `);
});

router.get("/verify-email", (req, res) => {
  const { user, token } = req.query;

  if (!user || !token) {
    return res.status(400).send(`
      <h1>Missing Parameters</h1>
      <p>Both user and token parameters are required.</p>
    `);
  }

  const userRecord = getUserFromDatabase(user as string);

  if (userRecord) {
    const { token: savedToken, tokenExpiration } =
      getEmailVerificationTokenFromDatabase(userRecord.username);

    if (token === savedToken && Date.now() < Number(tokenExpiration)) {
      updateUserEmailVerificationStatus(userRecord.username, true);
      res.send(`
        <h1>Email Verified!</h1>
        <p>Your email has been successfully verified. You can now <a href="/login">log in.</a></p>
      `);
    } else {
      res.status(400).send(`
        <h1>Invalid or Expired Token</h1>
        <p>The verification link is either invalid or has expired. <a href="/resend-verification?username=${userRecord.username}">Click here to request a new link.</a></p>
      `);
    }
  } else {
    res.status(400).send(`
      <h1>User Not Found</h1>
      <p>We couldn't find a user with that ID.</p>
    `);
  }
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
      // TODO: start user session
      res.redirect("/dashboard");
    });
  }
});

router.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "dashboard.html"));
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error during logout");
    }
    // TODO: end session

    res.redirect("/");
  });
});

export default router;
