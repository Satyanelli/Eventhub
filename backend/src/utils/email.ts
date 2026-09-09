
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: EmailAttachment[]
) {
  await transporter.sendMail({
    from: `"EventHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
}

