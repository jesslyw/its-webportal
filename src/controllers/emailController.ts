import express from "express";
const router = express.Router();
import {
  getUserFromDatabase,
  saveEmailVerificationTokenToDatabase,
  getEmailVerificationTokenFromDatabase,
  updateUserEmailVerificationStatus,
} from "../models/userModel";
import { generateEmailVerificationToken } from "../utils/cryptoUtils";
import { BASE_URL, TOKEN_EXPIRATION_IN_MIN } from "../config.ts";

router.get("/resend-verification", (req, res) => {
  const { username } = req.query;

  const userRecord = getUserFromDatabase(username as string);
  if (userRecord) {
    const token = generateEmailVerificationToken();

    const expirationTime: number =
      Date.now() + TOKEN_EXPIRATION_IN_MIN * 60 * 1000; // 1 hour

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
  const verificationLink = `http://${BASE_URL}:3000/verify-email?user=${username}&token=${token}`;

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

export default router;
