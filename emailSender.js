const nodemailer = require('nodemailer');

const sendEmail = (personDetails) => {
   
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider
        auth: {
          user: 'support@coralacademy.com',
          pass: 'wbao qowd tfcc hpua',
        },
      });

      const prefix = "want another slot:";
      let flag = false;
      
      let classes = '';
      let classes2 = '';

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

            
                let regex = new RegExp(prefix, "gi"); // "gi" stands for global and case-insensitive

                let modifiedTimeslot = timeslot.replace(regex, "Preferred Timing : ");
                console.log('timeslot is ',modifiedTimeslot);
                if(timeslot.toLowerCase().startsWith(prefix)){
                    flag=true;
                    classes2 += `
                    <div class="class_div">
                    <p class="custom-para">Class Name : ${className}</p>
                    <p class="custom-para">${modifiedTimeslot}</p>
                    </div>
                    `;
                }else{
                    classes += `
                <div class="class_div">
                <p class="custom-para">Class Name : ${className}</p>
                <p class="custom-para">Date & Time : ${modifiedTimeslot}</p>
                </div>
                `;

                }

            
        }
      });
      let message = '';
      if(flag==true){
        message = '<p>We noticed that you have also requested for additional time slots for some classes. We will try our best to schedule classes that work for you.</p>';
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
          }
          .class_div{
            margin-top: 20px;
            margin-bottom:25px;
          }
          @media screen and (max-width: 600px) {
            .class_div p{
                line-height: 1.4;
                font-size: 14px;

              }
        }
          
          
        </style>
      </head>
      <body>
        <div class="container">
          <p>Dear ${personDetails.parentName},</p>
          <p>Thank You for choosing us for ${personDetails.childName}'s learning adventure! It's a joy to have you onboard!</p>
          <p>Here are your confirmed classes :</p>
            ${classes}
          <p>The class zoom link and materials will be sent to you one day before class. Keep an eye on your email for these details!</p>  
          ${message}
          ${classes2}
          <p>We understand that plans might change - In case you would like to withdraw your child's enrolment from any class, please email us at support@coralacademy.com or send a text message to (872)-222-8643.</p>
          <p>Warm Regards,</p>
          <p>The Coral Academy Team</p>
        </div>
      </body>
      </html>
      `;
      
      // Email content
      const mailOptions = {
        from: 'support@coralacademy.com', // Sender's email address
        to:personDetails.email,
        subject: 'Thank You for enrolling '+personDetails.childName+'!',
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