// src/api/activities/handler.js
class PlaylistActivitiesHandler {
  constructor(playlistsService, activitiesService) {
    this._playlistsService = playlistsService;
    this._activitiesService = activitiesService;
  }

  // Handler buat GET /playlists/{id}/activities
  async getPlaylistActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // Cek dulu user punya hak akses ke playlist ini (owner atau collab)
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    
    // Ambil data aktivitas
    const activities = await this._activitiesService.getActivities(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

export default PlaylistActivitiesHandler;