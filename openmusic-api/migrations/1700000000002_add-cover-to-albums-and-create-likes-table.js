// migrations/1700000000002_add-cover-to-albums-and-create-likes-table.js

export const up = (pgm) => {
  // 1. Nambah kolom coverUrl ke tabel albums
  pgm.addColumn('albums', {
    coverUrl: {
      type: 'TEXT',
      notNull: false,
    },
  });

  // 2. Bikin tabel user_album_likes
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'albums(id)',
      onDelete: 'CASCADE',
    },
  });

  // 3. Tambah constraint UNIQUE biar user cuma bisa like 1 kali per album
  pgm.addConstraint('user_album_likes', 'unique_user_album_likes', 'UNIQUE(user_id, album_id)');
};

export const down = (pgm) => {
  // Urutan rollback
  pgm.dropTable('user_album_likes');
  pgm.dropColumn('albums', 'coverUrl');
};