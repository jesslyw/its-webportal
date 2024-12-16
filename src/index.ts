import express from "express";
import path from "path";
import dotenv from "dotenv";
import session from "express-session";
import userController from "./controllers/UserController"; // Import userController

dotenv.config(); // Load environment variables

const app = express();
const port = 3000;

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "../public")));

const sessionSecret: string = process.env.SESSION_SECRET as string;
// Session configuration
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Prevent JavaScript access to the cookie
      maxAge: 60 * 60 * 1000, // Session expiry in 1 hour
    },
  })
);

app.use(userController);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// function CipherKey(SESSION_SECRET: string | undefined) {
//   throw new Error("Function not implemented.");
// }
