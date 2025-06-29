const nodemailer = require('nodemailer');

const sendRecoverEmail = async (email, username, recoverUrl) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_ADDRESS,
            pass: process.env.APP_PASSWORD
        }
    });

    const htmlContent = `
        <div style="background-color: #f4f4f4; padding: 20px;">
            <img src="https://drive.google.com/uc?export=view&id=1CNBxGceXZod7lsPs0DVWw_ev1dxObBYb" alt="ChatH Logo" style="display: block; margin: 0 auto; width: 150px; height: auto;">
            <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <p style="font-size: 18px;">Hello ${username},</p>
                <p>We have received a request to recover your account.</p>
                <p>Please click on the following link to reset your password and regain access to your account:</p>
                <a href="${recoverUrl}" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">Reset Password</a>
                <p>Please note that the recovery link will expire in one hour.</p>
                <p>If you did not request this, please ignore this email.</p>
                <p>Thank you,<br>ChatH</p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: 'haindchv@gmail.com',
        to: email,
        subject: 'ChatH | Recover your account',
        html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent");
};

module.exports = { sendRecoverEmail }