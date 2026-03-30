import Mailgun from "mailgun.js";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const DOMAIN = process.env.MAILGUN_DOMAIN;

// Clean HTML Template
const htmlTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Blog Post</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="margin:20px 0;">
          
          <tr>
            <td align="center" style="padding:20px;">
              <h1 style="margin:0; color:#333333;">Resurrection Baptist Church</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:20px; color:#555555; font-size:15px; line-height:1.6;">

              <p>Dear Beloved,</p>
              <p>Greetings in Christ!</p>

              <p>
                We're excited to share that a new blog post has been published on our church website.
              </p>

              <table width="100%" cellpadding="10" cellspacing="0" border="0" style="background:#f9f9f9; border-left:4px solid #4CAF50; margin:15px 0;">
                <tr>
                  <td>
                    <strong>Blog Title:</strong> {{title}}
                  </td>
                </tr>
              </table>

              <p>
                <strong>About this blog</strong><br>
                {{excerpt}}
              </p>

              <p>Take a few moments to read and reflect on this message.</p>

                <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:20px auto;">
                    <tr>
                        <td align="center">
                        <a href="{{blog_url}}" target="_blank" style="background-color:#4CAF50;color:#ffffff;padding:12px 20px;text-decoration:none;font-weight:bold;display:inline-block;border-radius:5px;">
                            Read Full Blog
                        </a>
                        </td>
                    </tr>
                </table>

              <p>
                If the button does not work, use this link:<br>
                <a href="{{blog_url}}" target="_blank" rel="noopener noreferrer">{{blog_url}}</a>
              </p>

              <p>
                Blessings,<br>
                <strong>Resurrection Baptist Church</strong><br>
                +91 9008469800
              </p>

            </td>
          </tr>

          <tr>
            <td align="center" style="padding:15px; font-size:13px; color:#999999;">
              <p>You are receiving this email because you are part of our church community.</p>
              <p>
                <a href="%unsubscribe_url%">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

// Utility to clean text (prevents encoding issues)
const clean = (str = "") =>
  str
    .replace(/[’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/–/g, "-");

// Replace placeholders safely
const buildHtml = ({ title, excerpt, blogUrl }) => {
  return htmlTemplate
    .replaceAll("{{title}}", clean(title))
    .replaceAll("{{excerpt}}", clean(excerpt))
    .replaceAll("{{blog_url}}", blogUrl);
};

const sendEmail = async ({ to, subject, excerpt, title }) => {
  try {
    const blogUrl ="https://resurrectionbaptistchurch.vercel.app";
    const html = buildHtml({ title, excerpt, blogUrl });

    const response = await mg.messages.create(DOMAIN, {
      from: `Church Blog <no-reply@${DOMAIN}>`,
      to,
      subject,
      html,
      text: `New blog published: ${title}\nRead here: ${blogUrl}`, // fallback
    });

    console.log("Email sent:", response.id);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export { sendEmail };