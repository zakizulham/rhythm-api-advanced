// migrations/1700000000001_create-all-tables.js

export const up = (pgm) => {
  // Tabel users
  pgm.createTable('users', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    username: { type: 'VARCHAR(50)', notNull: true, unique: true },
    password: { type: 'TEXT', notNull: true },
    fullname: { type: 'TEXT', notNull: true },
  });

  // Tabel albums
  pgm.createTable('albums', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'VARCHAR(100)', notNull: true },
    year: { type: 'INTEGER', notNull: true },
  });

  // Tabel songs
  pgm.createTable('songs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    title: { type: 'VARCHAR(100)', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    genre: { type: 'VARCHAR(50)', notNull: true },
    performer: { type: 'VARCHAR(100)', notNull: true },
    duration: { type: 'INTEGER' },
    album_id: { // Foreign key ke tabel albums
      type: 'VARCHAR(50)',
      references: 'albums(id)',
      onDelete: 'CASCADE',
    },
  });

  // Tabel playlists
  pgm.createTable('playlists', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    name: { type: 'VARCHAR(100)', notNull: true },
    owner: { // Foreign key ke tabel users
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  // Tabel authentications
  pgm.createTable('authentications', {
    token: { type: 'TEXT', notNull: true },
  });

  // Tabel playlistsongs (join table many-to-many playlists dan songs)
  pgm.createTable('playlistsongs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'songs(id)',
      onDelete: 'CASCADE',
    },
  });

  // Tabel collaborations
  pgm.createTable('collaborations', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  // Tabel playlist_song_activities
  pgm.createTable('playlist_song_activities', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'playlists(id)',
      onDelete: 'CASCADE',
    },
    song_id: { type: 'VARCHAR(50)', notNull: true },
    user_id: { type: 'VARCHAR(50)', notNull: true },
    action: { type: 'VARCHAR(10)', notNull: true },
    time: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_timestamp') },
  });
};

export const down = (pgm) => {
  // Drop tabel dalam urutan terbalik untuk menghindari error foreign key
  pgm.dropTable('playlist_song_activities');
  pgm.dropTable('collaborations');
  pgm.dropTable('playlistsongs');
  pgm.dropTable('authentications');
  pgm.dropTable('playlists');
  pgm.dropTable('songs');
  pgm.dropTable('albums');
  pgm.dropTable('users');
};