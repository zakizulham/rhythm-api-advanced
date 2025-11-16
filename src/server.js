// src/server.js
import 'dotenv/config';
import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import Inert from '@hapi/inert'; 
import path from 'path';
import { fileURLToPath } from 'url';
import ClientError from './exceptions/ClientError.js';

// --- IMPORTS: PLUGINS ---
import albumsPlugin from './api/albums/index.js';
import songsPlugin from './api/songs/index.js';
import usersPlugin from './api/users/index.js';
import authenticationsPlugin from './api/authentications/index.js';
import playlistsPlugin from './api/playlists/index.js';
import collaborationsPlugin from './api/collaborations/index.js';
import activitiesPlugin from './api/activities/index.js';
import likesPlugin from './api/likes/index.js';
import CacheService from './services/cache/CacheService.js';

// --- IMPORTS: SERVICES ---
import AlbumsService from './services/postgres/AlbumsService.js';
import SongsService from './services/postgres/SongsService.js';
import UsersService from './services/postgres/UsersService.js';
import AuthenticationsService from './services/postgres/AuthenticationsService.js';
import PlaylistsService from './services/postgres/PlaylistsService.js';
import CollaborationsService from './services/postgres/CollaborationsService.js';
import PlaylistActivitiesService from './services/postgres/PlaylistActivitiesService.js';
import StorageService from './services/storage/StorageService.js';

// --- IMPORTS: VALIDATORS ---
import AlbumsValidator from './validators/albums/index.js';
import SongsValidator from './validators/songs/index.js';
import UsersValidator from './validators/users/index.js';
import AuthenticationsValidator from './validators/authentications/index.js';
import PlaylistsValidator from './validators/playlists/index.js';
import CollaborationsValidator from './validators/collaborations/index.js';
import UploadsValidator from './validators/uploads/index.js';

// --- IMPORTS: OTHERS ---
import TokenManager from './tokenize/TokenManager.js';

// Konfigurasi Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const init = async () => {

  const cacheService = new CacheService();
  const collaborationsService = new CollaborationsService();
  const albumsService = new AlbumsService(cacheService);
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const activitiesService = new PlaylistActivitiesService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const storageService = new StorageService(path.resolve(__dirname, '../public/uploads/albums'));

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // tangkep semua error di satu tempat, jadi ga usah try-catch di tiap handler
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
      if (!response.isServer) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.output.statusCode);
        return newResponse;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }

    
    return h.continue;
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert, 
    },
  ]);

  // Strategi autentikasi jwt
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
        songsService: songsService,
        storageService: storageService,
        validator: AlbumsValidator,
        uploadsValidator: UploadsValidator,
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
  {
    plugin: likesPlugin,
    options: {
      albumsService,
    },
  },
]);

  // Rute buat akses file statis (gambar)
  server.route({
    method: 'GET',
    path: '/albums/covers/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../public/uploads/albums'),
      },
    },
  });

  await server.start();
  console.log(`Server nyala di ${server.info.uri}`);
};

init();