import { createTransport } from 'nodemailer';
import config from '../config';
import logger from './logger';

const smtpConfig = config.smtp;

const defaults = Object.assign({}, { from: smtpConfig.auth.user }, config.defaultMailOptions);
const transporter = createTransport(smtpConfig, defaults);

const mailer = {};

mailer.sendText = (to, subject, text) => mailer.send({ to, subject, text });
mailer.sendHtml = (to, subject, html) => mailer.send({ to, subject, html });

mailer.send = (data) => {
  const p = new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
  return p.catch(err => logger.warn('failed to send email.', err));
};

export default mailer;
