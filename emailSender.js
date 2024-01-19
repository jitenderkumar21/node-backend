const nodemailer = require('nodemailer');

const sendEmail = (personDetails) => {
   
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email service provider
        auth: {
          user: 'support@coralacademy.com',
          pass: 'xcvf sxnm yctg jvte',
        },
      });

      const prefix = "want another slot:";
      let flag = false;
      let confirmedClassesFlag = false;
      
      let classes = '';
      let classes2 = '';

      const classDetails = personDetails.classDetails;
      classDetails.forEach((classDetail) => {
        const { className, timeslot } = classDetail;
        if(timeslot){  
                let regex = new RegExp(prefix, "gi"); // "gi" stands for global and case-insensitive

                let modifiedTimeslot = timeslot.replace(regex, "Preferred Timing : ");
                
                if(timeslot.toLowerCase().startsWith(prefix)){
                    flag=true;
                    classes2 += `
                    <div class="class_div">
                    <p class="custom-para">Class Name : ${className}</p>
                    <p class="custom-para">${modifiedTimeslot}</p>
                    </div>
                    `;
                }else{
                  confirmedClassesFlag = true;
                    classes += `
                <div class="class_div">
                <p class="custom-para">Class Name : ${className}</p>
                <p class="custom-para">Date & Time : ${modifiedTimeslot}</p>
                <p class="custom-para">Zoom Link : https://zoom.us/j/3294240234?pwd=ajdsWWlDWHpialdXUklxME1UVzVrUT09</p>
                <p class="custom-para">Meeting ID :  329 424 0234 </p>
                <p class="custom-para">Passcode : 123456</p>
                </div>
                `;

                }

            
        }
      });
      let message = '';
      if(flag==true){
        message = '<p>We noticed that you have also requested for additional time slots for some classes. We will try our best to schedule classes that work for you.</p>';
      }
      let confirmedClassMessage1 = '';
      let confirmedClassMessage2 = '';
      if(confirmedClassesFlag==true){
        confirmedClassMessage1 = 'Here are your confirmed classes :';
        confirmedClassMessage2 = 'We will block your Calendars as well. The class materials, if any, will be sent to you one day before class. Keep an eye on your email for these details. Excited to see you in class!';
      }else{
        if(flag==true){
          message = '<p>We noticed that you have requested for additional time slots for some classes. We will try our best to schedule classes that work for you.</p>';
        }
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
            line-height: 1.4;
          }
          .class_div{
            margin-top: 20px;
            margin-bottom:50px;
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
          <p>${confirmedClassMessage1}</p>
            ${classes}
          <p>${confirmedClassMessage2}</p>  
          ${message}
          ${classes2}
          <p><b><i>Ensuring learner safety is our highest priority, we request you to switch on the learner's camera at the start of each class for a quick identity check. After confirmation, learners may choose to participate with the camera off.</i></b></p>
          <p>We understand that plans might change - In case you would like to withdraw your child's enrolment from any class, please email us at support@coralacademy.com or send a text message to (872)-222-8643.</p>
          <p>Also, we're committed to continuous improvement. Got suggestions? Share them in this form: <a href="https://docs.google.com/forms/d/e/1FAIpQLSflsLJJuG74V1jjS29B-R1TVPbD74e9H5CkKVQMX6CzM87AZQ/viewform">Link</a></p>
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
          console.log('Email sent to parent:', info.response);
        }
      });

  };
  
  module.exports = sendEmail;