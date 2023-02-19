export const isValidCredentials = (email: string, password: string) =>
  email.length > 0 &&
  email.length < 256 &&
  password.length > 7 &&
  password.length < 256;
