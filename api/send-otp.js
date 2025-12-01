import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, otp, userName } = req.body;

    if (!email || !otp || !userName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: {
        email: process.env.FROM_EMAIL || 'dehanv@masholdings.com',
        name: 'MAS Intimates'
      },
      subject: 'Your OTP Code - MAS Intimates Login',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MAS Intimates</h1>
              <p>One-Time Password</p>
            </div>
            <div class="content">
              <p>Dear ${userName},</p>
              <p>Your One-Time Password (OTP) for login is:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p><strong>Important:</strong></p>
              <ul>
                <li>This OTP is valid for 10 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
              <div class="footer">
                <p>This is an automated message from MAS Intimates. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await sgMail.send(msg);

    return res.status(200).json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('SendGrid Error:', error);
    
    if (error.response) {
      console.error('SendGrid Response Error:', error.response.body);
    }
    
    return res.status(500).json({ 
      error: 'Failed to send OTP',
      details: error.message 
    });
  }
}
