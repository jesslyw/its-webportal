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
 * user login (funktioniert nur, nachdem email validiert ist)
 */
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (findUsernameInDatabase(username)) {
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
 * neues passwort form
 */
app.get("/change-password", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.send(`
    <h1>Change Password</h1>
    <form method="POST" action="/change-password">
      <label for="oldPassword">Old Password:</label>
      <input type="password" name="oldPassword" required><br><br>
      <label for="newPassword">New Password:</label>
      <input type="password" name="newPassword" required><br><br>
      <button type="submit">Change Password</button>
    </form>
  `);
});

/**
 * passwort änderung in der csv übernehmen
 */
app.post("/change-password", (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // altes passwort überprüfen - wenn hash stimmt, neues passwort übernehmen

  res.send("Password updated successfully");
});

/**
 * email mit token verifizieren
 */
app.get("/activate/:token", (req, res) => {
  const { token } = req.params;

  // überpruft ob user und token richtig / noch valide ist
  // wenn ja, email als verifiziert markieren
  // wenn nein, neuer token an die email schicken

  res.send("Email verified successfully");
});

/**
 * user dashboard, für eingeloggte user
 */
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  // extra optionen für eingeloggte
  res.send(`
    <h1>Welcome ${req.session.user.username}</h1>
    <a href="/change-password">Change Password</a>
    <a href="/logout">Log Out</a>
  `);
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
