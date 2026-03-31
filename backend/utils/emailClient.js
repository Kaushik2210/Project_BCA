// Import the Mailgun.js SDK — a library for sending emails via the Mailgun API service.
import Mailgun from "mailgun.js";
// Import FormData — required by Mailgun.js for constructing multipart email payloads.
import FormData from "form-data";
// Import dotenv to load environment variables.
import dotenv from "dotenv";
dotenv.config();

// Create a new Mailgun instance, passing the FormData constructor.
const mailgun = new Mailgun(FormData);

// Initialize the Mailgun client with API credentials from environment variables.
const mg = mailgun.client({
  username: "api",                        // Mailgun requires "api" as the username
  key: process.env.MAILGUN_API_KEY,       // Your Mailgun API key from .env
});

// The verified Mailgun domain for sending emails.
const DOMAIN = process.env.MAILGUN_DOMAIN;

// ---- HTML EMAIL TEMPLATE ----
// This is the email template sent to newsletter subscribers when a new blog post is published.
// It uses placeholder tokens ({{title}}, {{excerpt}}, {{blog_url}}) that are replaced with actual data.
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

// Utility function to clean text strings by replacing special/smart characters with standard ASCII equivalents.
// This prevents encoding issues in email clients that don't support Unicode properly.
const clean = (str = "") =>
  str
    .replace(/['\u2019]/g, "'")      // Replace smart single quotes with regular apostrophe
    .replace(/["\u201C\u201D]/g, '"') // Replace smart double quotes with regular double quotes
    .replace(/\u2026/g, "...")        // Replace ellipsis character with three dots
    .replace(/\u2013/g, "-");         // Replace en-dash with regular hyphen

// Function that takes blog data and injects it into the HTML template, replacing all placeholders.
const buildHtml = ({ title, excerpt, blogUrl }) => {
  return htmlTemplate
    .replaceAll("{{title}}", clean(title))      // Replace all {{title}} placeholders
    .replaceAll("{{excerpt}}", clean(excerpt))  // Replace all {{excerpt}} placeholders
    .replaceAll("{{blog_url}}", blogUrl);        // Replace all {{blog_url}} placeholders
};

// ---- MAIN EMAIL SENDING FUNCTION ----
// This function is called by the BullMQ Worker (in app.js) for each email job in the queue.
const sendEmail = async ({ to, subject, excerpt, title }) => {
  try {
    // The URL of the deployed frontend website.
    const blogUrl = "https://resurrectionbaptistchurch.vercel.app";
    // Build the final HTML email by injecting the blog data into the template.
    const html = buildHtml({ title, excerpt, blogUrl });

    // Use the Mailgun client to create and send the email message.
    const response = await mg.messages.create(DOMAIN, {
      from: `Church Blog <no-reply@${DOMAIN}>`,  // Sender address (no-reply)
      to,                                          // Recipient email address
      subject,                                     // Email subject line
      html,                                        // The rendered HTML email body
      text: `New blog published: ${title}\nRead here: ${blogUrl}`, // Plain-text fallback for email clients that don't support HTML
    });

    // Log the Mailgun message ID on success.
    console.log("Email sent:", response.id);
  } catch (error) {
    // Log the error and re-throw so BullMQ can retry the job.
    console.error("Error sending email:", error);
    throw error;
  }
};
const appointmentHtmlTemplate=(name,date,time,meetingLink)=>{
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmation</title>
  </head>

<<<<<<< HEAD
// Export the sendEmail function.
export { sendEmail };
=======
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f4">
    <tr>
      <td align="center">

        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="margin:20px 0; border-radius:8px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:20px;">
              <h1 style="margin:0; color:#333;">Resurrection Baptist Church</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:20px; color:#555; font-size:15px; line-height:1.6;">

              <p>Dear <strong>${name || "Beloved"}</strong>,</p>

              <p>Greetings in Christ!</p>

              <p>
                Your appointment with the pastor has been successfully scheduled.
                Please find the details below:
              </p>

              <!-- Appointment Details -->
              <table width="100%" cellpadding="10" cellspacing="0" style="background:#f9f9f9; border-left:4px solid #4CAF50; margin:15px 0;">
                <tr>
                  <td>
                    <strong>Date:</strong> ${date}<br>
                    <strong>Time:</strong> ${time}<br>
                  </td>
                </tr>
              </table>

              <p>
                You can join the meeting using the link below at the scheduled time:
              </p>

              <!-- Button -->
              <table align="center" cellpadding="0" cellspacing="0" style="margin:20px auto;">
                <tr>
                  <td align="center" bgcolor="#4CAF50" style="padding:12px 20px; border-radius:5px;">
                    <a href="${meetingLink}" style="color:#ffffff; text-decoration:none; font-weight:bold;">
                      Join Google Meet
                    </a>
                  </td>
                </tr>
              </table>

              <p>
                If you are unable to attend, kindly inform us in advance.
              </p>

              <p>
                We look forward to connecting with you. May this meeting be a blessing to you.
              </p>

              <p>
                Blessings,<br>
                <strong>Resurrection Baptist Church</strong><br>
                +91 9008469800<br>
                <a href="https://resurrectionbaptistchurch.vercel.app">Visit Website</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:15px; font-size:13px; color:#999;">
              <p style="margin:5px 0;">You are receiving this email because you booked an appointment with us.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`
}

const sendAppointmentEmail = async ({ to, subject, meetLink,date,startTime,name }) =>{
  const emailContent=appointmentHtmlTemplate(name,date,startTime,meetLink);
  try {

    const response = await mg.messages.create(DOMAIN, {
      from: `Church Appointment <no-reply@${DOMAIN}>`,
      to,
      subject,
      html:emailContent,
    });

    console.log("Email sent:", response.id);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export { sendEmail,sendAppointmentEmail };
>>>>>>> d56c173a084be0303d84b1ef9433ddb271c59a82
