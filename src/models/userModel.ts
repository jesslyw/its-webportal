import fs from "fs";
import path from "path";
import { User } from "../types/User";

const usersFilePath = path.join(__dirname, "../users.csv");

const findUserInDatabase = (username: string): boolean => {
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
    const newUser = `${user.username},${user.email},${user.password},false\n`;
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

      const [storedUsername, email, password] = line.split(",");
      if (storedUsername === username) {
        const user: User = new User(storedUsername, email, password);
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
