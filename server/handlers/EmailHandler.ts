import path from "path";
import fs from "fs";

const VERIFICATION_TEMPLATE = fs.readFileSync(
  path.join(__dirname, "../templates/verification.html"),
  "utf8"
);
const DEFAULT_SENDER = "info@2anki.net";
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailHandler {
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
