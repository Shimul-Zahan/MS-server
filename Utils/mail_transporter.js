const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: "smtp.forwardemail.net",
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: "shimulzahan636@gmail.com",
        pass: "ueed kltn zqqz aenq",
    },
});

module.exports = transporter