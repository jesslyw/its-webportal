const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

// ressourcen definieren
app.use(express.static(path.join(__dirname, "../public")));
const usersFilePath = path.join(__dirname, "users.csv");

/**
 * home
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "register.html"));
});

/**
 * registration
 */
app.post("/register", (req, res) => {
  const { username, email, password } = req.body; // aus registration form

  // prüft, ob username schon vorhanden - wenn ja, frontned error ausgeben
  // passwort salt generieren und passwort hashen

  const newUser = {
    username,
    email,
    password: hashedPassword,
    salt,
    email_valid: "false", // noch nicht validiert
  };

  // save user
  res.send(`
    <h1>Registration Successful</h1>
    <p>Welcome, ${username}. Please check your email to verify your account.</p>
    <a href="/login">Go to Login</a>
  `);
});

/**
 * user login
 */
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (findUsernameInDatabase(username)) {
    // if email validiert:
    // credentials prüfen
    // log in

    res.send("Login successful");
  } else {
    res.send(`
      <h1>Login Failed</h1>
      <p>Incorrect username or password. Please try again.</p>
      <a href="/login">Go back to Login</a>
    `);
  }
});

/**
 * user logout
 */
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out");
    }
    // auf login page redirecten
    res.redirect("/login");
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
