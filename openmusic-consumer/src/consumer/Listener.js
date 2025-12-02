// src/consumer/Listener.js
class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      // 1. Parsing pesan dari RabbitMQ
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      // 2. Ambil lagu dari playlist
      const playlist = await this._playlistsService.getSongsFromPlaylist(playlistId);

      // 3. Kirim Email
      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify(playlist));
      
      console.log(`[Consumer] Email terkirim ke ${targetEmail}: ${result.messageId}`);
    } catch (error) {
      console.error('[Consumer] Gagal memproses pesan:', error);
    }
  }
}

export default Listener;