// src/api/likes/routes.js
import LikesHandler from './handler.js';
import routes from './routes.js';

const likesPlugin = {
    name: 'likes',
    version: '1.0.0',
    register: async (server, { service }) => {
    const likesHandler = new LikesHandler(service);
    server.route(routes(likesHandler));
  },
};

export default likesPlugin;