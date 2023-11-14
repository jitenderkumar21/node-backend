const nodemailer = require('nodemailer');

const sendEmailToUs = (personDetails) => {
   
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
          }
      
          p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
          }
      
        </style>
      </head>
      <body>
        <div class="container">
          <p>Hi</p>
          <p>There is a new sign up!</p>
          <ul>
            <li><strong>Parent's Name:</strong> ${personDetails.parentName}</li>
            <li><strong>Parent's Email:</strong> ${personDetails.email}</li>
            <li><strong>Learner's Name :</strong> ${personDetails.childName}</li>
            <li><strong>Learner's Age :</strong> ${personDetails.childAge}</li>
            <li><strong>Phone Number :</strong> ${personDetails.phoneNumber}</li>
            <li><strong>How did you get to know about us ? :</strong> ${personDetails.phoneNumber}</li>
            ${classes}
          </ul>
          <p>Thank you!</p>
        
        </div>
      </body>
      </html>
      `;
      
      // Email content
      const mailOptions = {
        from: 'support@coralacademy.com', // Sender's email address
        to:'support@coralacademy.com',
        subject: 'New Registration For Demo',
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
  
  module.exports = sendEmailToUs;