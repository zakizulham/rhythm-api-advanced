class ActivitiesHandler {
  constructor(playlistsService, activitiesService) {
    this._playlistsService = playlistsService;
    this._activitiesService = activitiesService;

    this.getActivitiesHandler = this.getActivitiesHandler.bind(this);
  }

  async getActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const activities = await this._activitiesService.getActivities(id);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

export default ActivitiesHandler;
