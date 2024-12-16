import bcrypt from "bcrypt";
const saltRounds = 10;
import crypto from "crypto";

const hashPassword = (
  password: string,
  callback: (err: any, hashedPassword: string) => void
) => {
  bcrypt.hash(password, saltRounds, callback);
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

export { hashPassword, comparePassword, generateEmailVerificationToken };
