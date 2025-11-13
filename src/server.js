// src/server.js
import 'dotenv/config'; 
import Hapi from '@hapi/hapi';
import ClientError from './exceptions/ClientError.js';
import Jwt from '@hapi/jwt';

// Impor Plugin
import albumsPlugin from './api/albums/index.js';
import songsPlugin from './api/songs/index.js';
import usersPlugin from './api/users/index.js';
import authenticationsPlugin from './api/authentications/index.js';
import playlistsPlugin from './api/playlists/index.js';
import collaborationsPlugin from './api/collaborations/index.js';
import activitiesPlugin from './api/activities/index.js';

// Impor Service & Validator
import AlbumsService from './services/postgres/AlbumsService.js';
import AlbumsValidator from './validators/albums/index.js';
import SongsService from './services/postgres/SongsService.js'; 
import SongsValidator from './validators/songs/index.js'; 
import UsersService from './services/postgres/UsersService.js'; 
import UsersValidator from './validators/users/index.js';
import AuthenticationsService from './services/postgres/AuthenticationsService.js';
import AuthenticationsValidator from './validators/authentications/index.js'; 
import TokenManager from './tokenize/TokenManager.js';  
import PlaylistsService from './services/postgres/PlaylistsService.js'; 
import PlaylistsValidator from './validators/playlists/index.js'; 
import CollaborationsService from './services/postgres/CollaborationsService.js'; 
import CollaborationsValidator from './validators/collaborations/index.js';
import PlaylistActivitiesService from './services/postgres/PlaylistActivitiesService.js';


const init = async () => {
  // Bikin instance service
  const collaborationsService = new CollaborationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const activitiesService = new PlaylistActivitiesService();
  const playlistsService = new PlaylistsService(collaborationsService);

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // buat nangkep semua error di satu tempat, jadi ga usah try-catch di tiap handler
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Kalo errornya emang salah client (400-an)
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Kalo errornya bukan dari server (kayak 404 bawaan Hapi)
      // Ini penting buat nangkep error rute-tidak-ditemukan
      if (!response.isServer) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.output.statusCode);
        return newResponse;
      }

      // Kalo servernya yang gagal (500)
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      console.error(response); // Nyatet error aslinya di console
      return newResponse;
    }

    // Kalo aman, lanjutin aja
    return h.continue;
  });

  // Registrasi plugin eksternal Hapi/JWT
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // Definisikan strategi autentikasi JWT
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 3600, // 1 jam
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Daftar plugin albums
  await server.register([
  {
    plugin: albumsPlugin,
    options: {
      service: albumsService,
      validator: AlbumsValidator,
    },
  },
  {
    plugin: songsPlugin,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  },
  { 
    plugin: usersPlugin,
    options: {
      service: usersService,
      validator: UsersValidator,
    },
  },
  { 
    plugin: authenticationsPlugin,
    options: {
      authenticationsService,
      usersService,
      tokenManager: TokenManager,
      validator: AuthenticationsValidator,
    },
  },
  {
    plugin: playlistsPlugin,
    options: {
      service: playlistsService,
      validator: PlaylistsValidator,
      activitiesService: activitiesService,
    },
  },
  {
    plugin: collaborationsPlugin,
    options: {
      collaborationsService,
      playlistsService,
      validator: CollaborationsValidator,
    },
  },
  {
    plugin: activitiesPlugin,
    options: {
      playlistsService,
      activitiesService,
    },
  },
  ]);

  await server.start();
  console.log(`Server nyala di ${server.info.uri}`);
};

init();