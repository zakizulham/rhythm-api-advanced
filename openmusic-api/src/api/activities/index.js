import ActivitiesHandler from './handler.js';
import routes from './routes.js';

export default {
  name: 'activities',
  version: '1.0.0',
  register: async (server, { playlistsService, activitiesService }) => {
    const activitiesHandler = new ActivitiesHandler(playlistsService, activitiesService);
    server.route(routes(activitiesHandler));
  },
};
