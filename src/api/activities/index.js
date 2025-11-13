// src/api/activities/index.js
import PlaylistActivitiesHandler from './handler.js';
import routes from './routes.js';

const activitiesPlugin = {
  name: 'activities',
  version: '1.0.0',
  register: async (server, { playlistsService, activitiesService }) => {
    const activitiesHandler = new PlaylistActivitiesHandler(
      playlistsService,
      activitiesService,
    );
    server.route(routes(activitiesHandler));
  },
};

export default activitiesPlugin;