import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  if (!apiKey || !fromEmail) {
    res.status(500).json({ message: 'Email service not configured' });
    return;
  }

  const { to, subject, text } = req.body || {};

  if (!to || !subject || !text) {
    res.status(400).json({ message: 'Missing to, subject, or text' });
    return;
  }

  try {
    await sgMail.send({
      to,
      from: fromEmail,
      subject,
      text,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('SendGrid error:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
}
