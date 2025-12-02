import 'dotenv/config';
import amqp from 'amqplib';
import PlaylistsService from '../services/postgres/PlaylistsService.js';
import MailSender from '../services/mail/MailSender.js';
import Listener from './Listener.js';
import config from '../utils/config.js';

const init = async () => {
  // 1. Inisialisasi Service
  const playlistsService = new PlaylistsService();
  const mailSender = new MailSender();
  
  const listener = new Listener(playlistsService, mailSender);

  // 2. Koneksi ke RabbitMQ
  const connection = await amqp.connect(config.rabbitMQ.server);
  const channel = await connection.createChannel();

  // 3. Pastikan Queue 'export:playlists' ada
  await channel.assertQueue('export:playlists', {
    durable: true,
  });

  // 4. Mulai dengerin
  channel.consume('export:playlists', listener.listen, { noAck: true });
  
  console.log(`Consumer berjalan, mendengarkan antrean 'export:playlists'...`);
};

init();
