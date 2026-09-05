const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOtpEmail = async (email, otp, purpose) => {

  console.log("========== EMAIL DEBUG ==========");
  console.log("Recipient:", email);
  console.log("OTP:", otp);
  console.log("Purpose:", purpose);
  console.log("=================================");

  if (!email) {
    throw new Error("Recipient email is missing");
  }

  if (!otp) {
    throw new Error("OTP is missing");
  }

  const subject =
    purpose === "SIGNUP"
      ? "Your Signup OTP"
      : "Your Password Reset OTP";

  const mailOptions = {
    from: `"TravDigit" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,

    text: `
Your OTP is: ${otp}

This OTP will expire in 5 minutes.

If you did not request this email, please ignore it.
    `,
  };

  console.log("MAIL OPTIONS:", {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
  });

  const info = await transporter.sendMail(mailOptions);

  console.log("✅ Email sent:", info.messageId);

  return info;
};

module.exports = {
  sendOtpEmail,
};