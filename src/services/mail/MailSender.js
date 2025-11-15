// src/services/mail/MailSender.js

import nodemailer from 'nodemailer';
import config from '../../utils/config.js';

class MailSender {
    constructor() {
        // buat 'transporter' sebagai tukang pos pake config dari .env
        this.transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            auth: {
                user: config.smtp.user,
                pass: config.smtp.pass,
            },
        });
    }

    // Fungsi untuk mengirim email
    sendEmail(targetEmail, content) {
        const message = {
            from: 'OpenMusic API <noreply@openmusic.com>',
            to: targetEmail,
            subject: 'Ekspor Playlist',
            text: 'Terlampir hasil ekspor playlist Anda.',
            attachments: [
                {
                    filename: 'playlist.json',
                    content,
                    contentType: 'application/json',
                },
            ],
        };
        return this.transporter.sendMail(message);
    }
}