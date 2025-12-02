// src/services/rabbitmq/ProducerService.js

import amqp from 'amqplib';
import config from '../../utils/config.js';

const ProducerService = {
    sendMessage: async (queue, message) => {
        // Bikin koneksi ke RabbitMQ server
        const connection = await amqp.connect(config.rabbitMQ.server);

        // Bikin channel
        const channel = await connection.createChannel();

        // Pastikan queue ada
        await channel.assertQueue(queue, { durable: true });

        // Kirim pesan (sebagai Buffer)
        channel.sendToQueue(queue, Buffer.from(message));

        // Tutup koneksi setelah satu detik
        setTimeout(() => { connection.close(); }, 1000);
    },
};

export default ProducerService;