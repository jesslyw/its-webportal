import fs from "fs";
import path from "path";
import { User } from "../types/User";

const usersFilePath = path.join(__dirname, "../users.csv");

const userFoundInDatabase = (username: string): boolean => {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    const lines = data.split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;
      const [storedUsername] = line.split(",");
      if (storedUsername === username) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.log("Error reading CSV file: " + error);
    return false;
  }
};

const saveUserInDatabase = (user: User): void => {
  try {
    const newUser = `${user.username},${user.email},${user.password},${user.isValidated}\n`;
    fs.appendFileSync(usersFilePath, newUser, "utf8");
  } catch (error) {
    console.error("Error saving user to database: " + error);
  }
};

const getUserFromDatabase = (username: string): User | null => {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    const lines = data.split("\n");

    for (const line of lines) {
      if (!line.trim()) continue; // ignore empty lines

      const [storedUsername, email, password, isValidated] = line.split(",");
      if (storedUsername === username) {
        const isUserValidated = isValidated === "true";

        const user: User = new User(
          storedUsername,
          email,
          password,
          isUserValidated
        );
        return user;
      }
    }
    // no user was found
    return null;
  } catch (error) {
    console.error("Error reading user from database: " + error);
    return null;
  }
};

const saveEmailVerificationTokenToDatabase = (
  username: string,
  token: string,
  expirationTime: number
): void => {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    const lines = data.split("\n");

    const updatedLines = lines.map((line) => {
      const [storedUsername, email, password, isValidated] = line.split(",");
      if (storedUsername === username) {
        return `${storedUsername},${email},${password},${isValidated},${token},${expirationTime}`;
      }
      return line;
    });

    fs.writeFileSync(usersFilePath, updatedLines.join("\n"), "utf8");
  } catch (error) {
    console.error("Error saving email verification token: " + error);
  }
};

const getEmailVerificationTokenFromDatabase = (username: string) => {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    const lines = data.split("\n");

    for (const line of lines) {
      if (!line.trim()) continue; // ignore empty lines
      const [
        storedUsername,
        email,
        password,
        isValidated,
        token,
        tokenExpiration,
      ] = line.split(",");
      if (storedUsername === username) {
        return { token, tokenExpiration };
      }
    }

    // if not found, return null
    return { token: null, tokenExpiration: null };
  } catch (error) {
    console.error("Error reading email verification token: " + error);
    return { token: null, tokenExpiration: null };
  }
};

const updateUserEmailVerificationStatus = (
  username: string,
  isValidated: boolean
): void => {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    const lines = data.split("\n");

    const updatedLines = lines.map((line) => {
      const [
        storedUsername,
        email,
        password,
        isValidatedOld,
        token,
        tokenExpiration,
      ] = line.split(",");
      if (storedUsername === username) {
        return `${storedUsername},${email},${password},${isValidated},${token},${tokenExpiration}`;
      }
      return line;
    });

    fs.writeFileSync(usersFilePath, updatedLines.join("\n"), "utf8");
  } catch (error) {
    console.error("Error updating user email verification status: " + error);
  }
};

export {
  userFoundInDatabase,
  saveUserInDatabase,
  getUserFromDatabase,
  saveEmailVerificationTokenToDatabase,
  getEmailVerificationTokenFromDatabase,
  updateUserEmailVerificationStatus,
};
