const nodeMailer = require('nodemailer')
const ejs = require('ejs')
const htmlToText = require('html-to-text')

const sendMail = async (options) => {
  // 1 Create Transportor
  console.log('🚀 ~ sendMail ~ process.env.SENDGRID_API_KEY', process.env.SENDGRID_API_KEY)
  const transportor = nodeMailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  })

  // 2 Render HTML Based on ejs template
  const html = await ejs.renderFile(`${__dirname}/../views/email/${options.template}`, {
    user: options.user,
    url: options.url,
  })
  console.log(options)

  // console.log(html);

  // 3 Define Mail Options
  const mailOptions = {
    from: process.env.Email_From,
    to: options.email,
    subject: options.subject,
    // text: htmlToText.fromString(html),
    html,
  }

  // 4 Send Email
  await transportor.sendMail(mailOptions)
}

module.exports = sendMail
