const nodeMailer = require('nodemailer')
const { google } = require('googleapis')
const axios = require('axios')
const OAuth2 = google.auth.OAuth2
const qs = require('qs');


const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    )

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    })

    const tokenUrl = 'https://oauth2.googleapis.com/token';

    const requestData = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token'
    };

    const response = await axios.post(tokenUrl, qs.stringify(requestData), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    const accessToken = response.data.access_token;

    const transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL,
            accessToken,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN
        }
    })

    return transporter
}

const sendActivationMail = async (to, link) => {
    let emailTransporter = await createTransporter()
    await emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: 'Активация аккаунта MSSP Global ',
        text: '',
        html:
        `
        <div>
            <h1>Для активации аккаунта перейдите по ссылке:</h1>
            <a href="${link}">${link}</a>
            <p>С уважением, команда MSSP Global</p>
        </div>
        `
    })
}

const sendResetPassEmail = async (to, link) => {
    console.log(to, link)
    try {
        let emailTransporter = await createTransporter();
        await emailTransporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Сброс пароля ' + process.env.API_URL,
            text: '',
            html:
            `
            <div>
                <h1>Для сброса пароля аккаунта перейдите по ссылке:</h1>
                <a href="${link}">${link}</a>
            </div>
            `
        });
    } catch (error) {
        console.error('Error sending password reset email:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            console.error('Response headers:', error.response.headers);
        }
    }
}


module.exports = {
    sendActivationMail,
    sendResetPassEmail
}