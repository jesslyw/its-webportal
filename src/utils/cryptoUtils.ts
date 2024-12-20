import bcrypt from "bcrypt";
const saltRounds = 10;
import crypto from "crypto";

const hashPassword = (
  password: string,
  callback: (err: any, hashedPassword: string) => void
) => {
  bcrypt.hash(password, saltRounds, callback);
};

const hashPassword_promise = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        reject(err); // Reject the promise if there's an error
      } else {
        resolve(hashedPassword); // Resolve the promise with the hashed password
      }
    });
  });
};

const comparePassword = (
  password: string | undefined,
  hashedPassword: string,
  callback: (err: any, result: boolean) => void
) => {
  bcrypt.compare(password, hashedPassword, callback);
};

const generateEmailVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex"); // random 32-byte token
};

export {
  hashPassword_promise,
  hashPassword,
  comparePassword,
  generateEmailVerificationToken,
};
