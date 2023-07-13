const nodeMailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2


const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    )

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    })

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if(err) {
                reject()
            }
            resolve(token)
        })
    })

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

// const sendResetPassEmail = async (to, link) => {
//     let emailTransporter = await createTransporter()
//     await emailTransporter.sendMail({
//         from: process.env.SMTP_USER,
//         to,
//         subject: 'Сброс пароля ' + process.env.API_URL,
//         text: '',
//         html:
//         `
//         <div>
//             <h1>Для сброса пароля аккаунта перейдите по ссылке</h1>
//             <a href="${link}">${link}</a>
//         </div>
//         `
//     })
// }


module.exports = sendActivationMail