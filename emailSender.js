const nodemailer = require('nodemailer');

const sendEmail = (to) => {
   
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider
        auth: {
          user: 'jitender091kumar@gmail.com',
          pass: 'tsjm idxn abvb lfho',
        },
      });
      const emailContent = `
      <html>
      <head>
        <title>Demo Registration Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
          }
      
          .container {
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin: 0 auto;
            width: 80%;
          }
      
          h1 {
            color: #333;
            font-size: 24px;
            text-align: center;
          }
      
          p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
          }
      
          .btn {
            background-color: #007bff;
            border: none;
            color: #fff;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Demo Registration Confirmation</h1>
          <p>Dear User,</p>
          <p>Thank you for registering for our demo classes. We are excited to have you!</p>
          <p><strong>Event Details:</strong></p>
          <ul>
            <li><strong>Date:</strong> [Event Date]</li>
            <li><strong>Location:</strong> [Event Location]</li>
            <li><strong>Time:</strong> [Event Time]</li>
            <li><strong>Confirmation Number:</strong> [Confirmation Number]</li>
          </ul>
          <p>We look forward to seeing you there.</p>
          <p>Best regards,</p>
          <p>Coral Academy Team</p>
          <p><a class="btn" href="[Event Details URL]">View Event Details</a></p>
        </div>
      </body>
      </html>
      `;
      
      // Email content
      const mailOptions = {
        from: 'jitender091kumar@gmail.com', // Sender's email address
        to,
        subject: 'Thanks for choosing Coral Academy',
        // text: 'This is the email body text.',
        html:emailContent,
      };
      
      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

  };
  
  module.exports = sendEmail;