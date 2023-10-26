const nodemailer = require('nodemailer');

const sendEmail = (personDetails) => {
   
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider
        auth: {
          user: 'support@coralacademy.com',
          pass: 'wbao qowd tfcc hpua',
        },
      });

      let classes = '';

      const classDetails = personDetails.classDetails;
      classDetails.forEach((classDetail) => {
        const { className, timeslot } = classDetail;
        if(timeslot){
            classes += `
                <li><strong>${className}</strong>
                <ul>
                    <li>Date & Time: ${timeslot}</li>
                </ul>
                </li>
                `;
        }
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
          <p>Dear ${personDetails.parentName},</p>
          <p>We appreciate your registration for our upcoming demo classes and are thrilled to have you on
          board!</p>
          <p>Here are the class details for ${personDetails.childName} :</p>
          <ul>
            ${classes}
          </ul>
          <p>We're excited to see you in class. If any unforeseen circumstances prevent you from attending
          the class, please don't hesitate to notify us promptly at support@coralacademy.com</p>
          <p>Warm Regards,</p>
          <p>The Coral Academy Team</p>
        </div>
      </body>
      </html>
      `;
      
      // Email content
      const mailOptions = {
        from: 'jitender091kumar@gmail.com', // Sender's email address
        to:personDetails.email,
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