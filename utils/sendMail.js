import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const sendMail = async (req, res) => {
    const { name, frommail, tomail, subject, text, html } = req.body;

    const oAuth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLEINT_SECRET,
        process.env.REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

    async function sendMail() {
        try {
            const accessToken = await oAuth2Client.getAccessToken();

            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: 'ashaban7642@gmail.com',
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLEINT_SECRET,
                    refreshToken: process.env.REFRESH_TOKEN,
                    accessToken: accessToken,
                },
            });

            const mailOptions = {
                from: `${name} <${frommail}>`,
                to: `${tomail}`,
                subject,
                text: text,
                html: html,
            };

            const result = await transport.sendMail(mailOptions);
            res.json(result);
        } catch (error) {
            return error;
        }
    }

    sendMail()
        .then((result) => console.log('Email sent...', result))
        .catch((error) => console.log(error.message));
};

export default sendMail;
