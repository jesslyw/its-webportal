const express = require("express");
const app = express();

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
