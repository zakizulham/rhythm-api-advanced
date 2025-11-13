// src/api/albums/index.js
import AlbumsHandler from './handler.js';
import routes from './routes.js';

const albumsPlugin = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, songsService, storageService, validator, uploadsValidator }) => {
    const albumsHandler = new AlbumsHandler(
      service,
      songsService,
      storageService,
      validator,
      uploadsValidator,
    );
    server.route(routes(albumsHandler));
  },
};

export default albumsPlugin;