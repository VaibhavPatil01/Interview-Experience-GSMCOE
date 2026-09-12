import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

dotenv.config();

// Setup Node Mailer
const SMTP_LOGIN = process.env['SMTP_LOGIN'];
const SMTP_KEY = process.env['SMTP_KEY']; 

if (!SMTP_LOGIN || !SMTP_KEY) {
  throw new Error('SMTP_LOGIN or SMTP_KEY not defined in .env');
}

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 465,
  secure: true,
  auth: {
    user: SMTP_LOGIN,
    pass: SMTP_KEY,
  },
});

// Config Handlebars options
const handlebarOptions = {
  viewEngine: {
    partialsDir: path.join(__dirname, './views'),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, './views'),
};

// Attach Handlebars with Nodemailer
transporter.use('compile', hbs(handlebarOptions));

export default transporter.sendMail.bind(transporter);