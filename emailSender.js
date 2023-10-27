const nodemailer = require('nodemailer');

const sendEmail = (personDetails) => {
   
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider
        auth: {
          user: 'support@coralacademy.com',
          pass: 'wbao qowd tfcc hpua',
        },
      });

      const prefix = "want another slot";
      let flag = false;
      
      let classes = '';

      const classDetails = personDetails.classDetails;
      classDetails.forEach((classDetail) => {
        const { className, timeslot } = classDetail;
        if(timeslot){
            // classes += `
            //     <li><strong>${className}</strong>
            //     <ul>
            //         <li>Date & Time: ${timeslot}</li>
            //     </ul>
            //     </li>
                // `;

                if(timeslot.toLowerCase().startsWith(prefix)){
                    flag=true;
                }

                let regex = new RegExp(prefix, "gi"); // "gi" stands for global and case-insensitive

                let modifiedTimeslot = timeslot.replace(regex, "Preferred time slot");
                console.log('timeslot is ',modifiedTimeslot);

            classes += `
               <p class="custom-para"><strong>${className}:</strong></p>
               <p class="custom-para">- Date & Time: ${modifiedTimeslot}</p>
            `;
            
        }
      });
      let message = '';
      if(flag==true){
        message = '<p>Thanks for letting us know your preferred time slots. We will try our best to schedule classes aligning with your child’s availability.</p>';
      }
      
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
            margin-left: 2%;
            margin-top:0;
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
      
          .custom-para {
            color: #666;
            font-size: 16px;
            line-height: 0.6;
            margin-left:5%;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <p>Dear ${personDetails.parentName},</p>
          <p>We appreciate your registration for our upcoming demo classes and are thrilled to have you on board!</p>
          <p>Here are your selected classes for ${personDetails.childName} :</p>
            ${classes}
            ${message}
          <p>We will get back to you with more details shortly.  We understand that plans change - In case you would like to alter your selection, please don't hesitate to email us at support@coralacademy.com</p>
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
        subject: 'Confirmation Mail',
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