// src/api/activities/routes.js
const routes = (handler) => [
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (request) => handler.getPlaylistActivitiesHandler(request),
    options: {
      auth: 'openmusic_jwt', // Wajib login
    },
  },
];

export default routes;