export class User {
  username: string;
  email: string;
  password: string;
  isValidated: boolean;
  verificationToken: string | null;
  verificationTokenExpires: number | null;

  constructor(
    username: string,
    email: string,
    password: string,
    isValidated: boolean,
    verificationToken: string | null = null,
    verificationTokenExpires: number | null = null
  ) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.isValidated = isValidated;
    this.verificationToken = verificationToken;
    this.verificationTokenExpires = verificationTokenExpires;
  }
}
