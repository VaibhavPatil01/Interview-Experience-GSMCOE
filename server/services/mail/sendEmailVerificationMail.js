import sendMail from './sendMail.js';

const sendEmailVerificationMail = async (email, token, username) => { 
  const SERVER_BASE_URL = process.env['SERVER_BASE_URL'];
  if (!SERVER_BASE_URL) {
    throw new Error('SERVER_BASE_URL not Defined'); 
  }

  const verificationURL = SERVER_BASE_URL + '/user/verify-email/' + token;
  const senderEmail = process.env['MAIL_USER'];
  const emailSubject = 'Verify your Email on Interview Experience';
  const emailTemplate = 'user_email_verification';
  const officialName = 'InterviewExperience';
  const context = { verificationURL, username, officialName };

  const mailOptions = {
    from: senderEmail,
    to: email,
    subject: emailSubject,
    template: emailTemplate,
    context: context,
  };

try {
  const info = await sendMail(mailOptions);
  return info;
} catch (error) {
  console.error("❌ Failed to send verification email:", error);
  throw new Error(`Failed to send verification email: ${error.message}`);
}

};

export default sendEmailVerificationMail;