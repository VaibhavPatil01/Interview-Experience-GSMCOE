import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

dotenv.config();

// Setup Node Mailer
const MAIL_USER = process.env['MAIL_USER'];
const MAIL_PASSWORD = process.env['MAIL_PASSWORD']; 

if (!MAIL_USER || !MAIL_PASSWORD) {
  throw new Error('MAIL_USER or MAIL_PASSWORD not defined in .env');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },
  host: 'smtp.gmail.com',
  port: 465,
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