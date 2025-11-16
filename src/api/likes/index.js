// src/api/likes/routes.js
import AlbumLikesHandler from './handler.js';
import routes from './routes.js';

const likesPlugin = {
    name: 'likes',
    version: '1.0.0',
    register: async (server, { likesService, albumsService, validator }) => {
        const albumLikesHandler = new AlbumLikesHandler(likesService, albumsService, validator);
        server.route(routes(albumLikesHandler));
    },
};

export default likesPlugin;