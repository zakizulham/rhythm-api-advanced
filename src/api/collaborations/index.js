// src/api/collaborations/index.js
import CollaborationsHandler from './handler.js';
import routes from './routes.js';

const collaborationsPlugin = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collaborationsService, playlistsService, validator }) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService,
      playlistsService,
      validator,
    );
    server.route(routes(collaborationsHandler));
  },
};

export default collaborationsPlugin;