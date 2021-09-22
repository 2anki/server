import path from "path";
import fs from "fs";

const VERIFICATION_TEMPLATE = fs.readFileSync(
  path.join(__dirname, "../templates/emails/verification.html"),
  "utf8"
);
const PASSWORD_RESET_TEMPLATE = fs.readFileSync(
  path.join(__dirname, "../templates/emails/reset.html"),
  "utf8"
);
const DEFAULT_SENDER = "info@2anki.net";
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailHandler {
  static SendResetEmail(domain: string, email: any, token: string) {
    let link = `http://${domain}/users/r/${token}`;
    const markup = PASSWORD_RESET_TEMPLATE.replace("{{link}}", link);
    const msg = {
      to: email,
      from: DEFAULT_SENDER,
      subject: "Reset your 2anki.net password",
      text:
        "I received your password change request, you can change it here" +
        link,
      html: markup,
    };

    return sgMail.send(msg);
  }
  static async SendVerificationEmail(
    domain: string,
    email: string,
    token: string
  ) {
    let link = `http://${domain}/users/v/${token}`;
    const markup = VERIFICATION_TEMPLATE.replace("{{link}}", link);

    const msg = {
      to: email,
      from: DEFAULT_SENDER,
      subject: "Verify your 2anki.net account",
      text: "Please verify your account by visiting the following link " + link,
      html: markup,
    };

    return sgMail.send(msg);
  }
}

export default EmailHandler;
