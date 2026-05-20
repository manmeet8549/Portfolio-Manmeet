/**
 * Portfolio Contact Form Server
 * Receives contact form submissions and sends emails via Brevo (Sendinblue).
 * 
 * Two emails are sent per submission:
 * 1. Notification email to the site owner (manmeetsinghvirdi41@gmail.com)
 * 2. Confirmation email to the user who submitted the form
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { BrevoClient } = require('@getbrevo/brevo');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Brevo SDK Setup ---
const brevoClient = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

// --- Validation Helper ---
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// --- Email Templates ---

/**
 * Build the notification email HTML sent to the site owner.
 */
function buildOwnerEmailHtml({ name, email, subject, message }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:'Inter',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:0px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background-color:#0c0c0c; padding:32px 40px;">
                                <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:900; letter-spacing:-0.02em; text-transform:uppercase;">
                                    NEW INQUIRY
                                </h1>
                                <p style="margin:8px 0 0; color:#9ca3af; font-size:12px; letter-spacing:0.1em; text-transform:uppercase;">
                                    Portfolio Contact Form
                                </p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:40px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding-bottom:24px; border-bottom:1px solid #e5e7eb;">
                                            <p style="margin:0 0 4px; color:#9ca3af; font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase;">From</p>
                                            <p style="margin:0; color:#18181b; font-size:18px; font-weight:700; letter-spacing:-0.02em;">${name}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:24px 0; border-bottom:1px solid #e5e7eb;">
                                            <p style="margin:0 0 4px; color:#9ca3af; font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase;">Email</p>
                                            <a href="mailto:${email}" style="color:#0053db; font-size:16px; font-weight:600; text-decoration:none;">${email}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:24px 0; border-bottom:1px solid #e5e7eb;">
                                            <p style="margin:0 0 4px; color:#9ca3af; font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase;">Subject</p>
                                            <p style="margin:0; color:#18181b; font-size:16px; font-weight:600;">${subject || 'No subject provided'}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:24px 0 0;">
                                            <p style="margin:0 0 4px; color:#9ca3af; font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase;">Message</p>
                                            <p style="margin:0; color:#374151; font-size:15px; line-height:1.7; white-space:pre-wrap;">${message}</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#fafafa; padding:24px 40px; border-top:1px solid #e5e7eb;">
                                <p style="margin:0; color:#9ca3af; font-size:11px; letter-spacing:0.05em;">
                                    Reply directly to this email to respond to <strong>${name}</strong>.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}

/**
 * Build the confirmation email HTML sent to the user.
 */
function buildUserConfirmationHtml({ name, subject, message }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:'Inter',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:0px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background-color:#0c0c0c; padding:32px 40px;">
                                <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:900; letter-spacing:-0.02em; text-transform:uppercase;">
                                    MANMEET SINGH
                                </h1>
                                <p style="margin:8px 0 0; color:#9ca3af; font-size:12px; letter-spacing:0.1em; text-transform:uppercase;">
                                    Message Received
                                </p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:40px;">
                                <h2 style="margin:0 0 16px; color:#18181b; font-size:24px; font-weight:800; letter-spacing:-0.02em;">
                                    Thank you, ${name}!
                                </h2>
                                <p style="margin:0 0 24px; color:#374151; font-size:15px; line-height:1.7;">
                                    I've received your message and appreciate you reaching out. I'll review your inquiry and get back to you as soon as possible, typically within 24-48 hours.
                                </p>

                                <!-- Message Summary -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; border-left:3px solid #0053db; margin:24px 0;">
                                    <tr>
                                        <td style="padding:20px 24px;">
                                            <p style="margin:0 0 4px; color:#9ca3af; font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase;">Your Subject</p>
                                            <p style="margin:0 0 16px; color:#18181b; font-size:14px; font-weight:600;">${subject || 'No subject'}</p>
                                            <p style="margin:0 0 4px; color:#9ca3af; font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase;">Your Message</p>
                                            <p style="margin:0; color:#374151; font-size:13px; line-height:1.6; white-space:pre-wrap;">${message}</p>
                                        </td>
                                    </tr>
                                </table>

                                <p style="margin:24px 0 0; color:#6b7280; font-size:13px; line-height:1.6;">
                                    In the meantime, feel free to explore my work:
                                </p>
                                <table cellpadding="0" cellspacing="0" style="margin:16px 0 0;">
                                    <tr>
                                        <td style="padding-right:12px;">
                                            <a href="https://manmeetsingh.me/projects.html" style="display:inline-block; background-color:#0053db; color:#ffffff; padding:12px 24px; font-size:12px; font-weight:700; text-decoration:none; text-transform:uppercase; letter-spacing:0.05em;">
                                                View Projects
                                            </a>
                                        </td>
                                        <td>
                                            <a href="https://www.linkedin.com/in/manmeet-singh-0b91262b6" style="display:inline-block; background-color:#18181b; color:#ffffff; padding:12px 24px; font-size:12px; font-weight:700; text-decoration:none; text-transform:uppercase; letter-spacing:0.05em;">
                                                LinkedIn
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background-color:#0c0c0c; padding:24px 40px;">
                                <p style="margin:0; color:#6b7280; font-size:11px; letter-spacing:0.05em;">
                                    © ${new Date().getFullYear()} Manmeet Singh. All rights reserved.
                                </p>
                                <p style="margin:8px 0 0; color:#4b5563; font-size:10px;">
                                    This is an automated confirmation. Please do not reply to this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}

// --- Routes ---

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Name is required.' });
    }
    if (!email || !email.trim()) {
        return res.status(400).json({ success: false, error: 'Email is required.' });
    }
    if (!isValidEmail(email.trim())) {
        return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    const cleanData = {
        name: name.trim(),
        email: email.trim(),
        subject: subject ? subject.trim() : '',
        message: message.trim()
    };

    // Send emails in the background to provide an immediate response to the user
    const ownerEmailPromise = brevoClient.transactionalEmails.sendTransacEmail({
        sender: {
            name: process.env.SENDER_NAME,
            email: process.env.SENDER_EMAIL
        },
        to: [{ email: process.env.RECEIVER_EMAIL, name: process.env.SENDER_NAME }],
        replyTo: { email: cleanData.email, name: cleanData.name },
        subject: `New Inquiry: ${cleanData.subject || 'No Subject'} — from ${cleanData.name}`,
        htmlContent: buildOwnerEmailHtml(cleanData)
    });

    const userEmailPromise = brevoClient.transactionalEmails.sendTransacEmail({
        sender: {
            name: process.env.SENDER_NAME,
            email: process.env.SENDER_EMAIL
        },
        to: [{ email: cleanData.email, name: cleanData.name }],
        subject: `Thanks for reaching out, ${cleanData.name}! — Manmeet Singh`,
        htmlContent: buildUserConfirmationHtml(cleanData)
    });

    Promise.all([ownerEmailPromise, userEmailPromise])
        .then(() => {
            console.log(`✉️  Notification email sent to ${process.env.RECEIVER_EMAIL}`);
            console.log(`✉️  Confirmation email sent to ${cleanData.email}`);
        })
        .catch(err => {
            // Parse the Brevo error for useful details
            const statusCode = err?.statusCode || err?.status || 'unknown';
            const body = err?.body || err?.response?.body || {};
            
            console.error(`\nBrevo API error: Status code: ${statusCode}`);
            console.error(`Body: ${JSON.stringify(body, null, 2)}`);

            if (statusCode === 401) {
                console.error('⚠️  FIX: Go to https://app.brevo.com/security/authorised_ips and add your IP, or disable IP whitelisting.');
            }
        });

    // Immediately respond to user without waiting for emails to finish sending
    res.json({ success: true, message: 'Message sent successfully!' });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`\n🚀 Portfolio Contact Server running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Contact: POST http://localhost:${PORT}/api/contact\n`);
});
