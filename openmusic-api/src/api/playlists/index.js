// src/api/playlists/index.js
import PlaylistsHandler from './handler.js';
import routes from './routes.js';

const playlistsPlugin = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { service, validator, activitiesService }) => {
    const playlistsHandler = new PlaylistsHandler(service, validator, activitiesService);
    server.route(routes(playlistsHandler));
  },
};

export default playlistsPlugin;