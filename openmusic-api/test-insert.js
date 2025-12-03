import 'dotenv/config';
import pg from 'pg';
import { nanoid } from 'nanoid';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

async function testInsert() {
  console.log('Testing DB Connection...');
  console.log(`Connecting to ${process.env.PGDATABASE} at ${process.env.PGHOST}:${process.env.PGPORT}`);

  try {
    // 1. Create a dummy user
    const userId = `user-${nanoid(16)}`;
    await pool.query('INSERT INTO users VALUES($1, $2, $3, $4)', [userId, 'testuser', 'password', 'Test User']);
    console.log('User created:', userId);

    // 2. Create a dummy playlist
    const playlistId = `playlist-${nanoid(16)}`;
    await pool.query('INSERT INTO playlists VALUES($1, $2, $3)', [playlistId, 'Test Playlist', userId]);
    console.log('Playlist created:', playlistId);

    // 3. Create a dummy song
    const songId = `song-${nanoid(16)}`;
    await pool.query('INSERT INTO songs VALUES($1, $2, $3, $4, $5)', [songId, 'Test Song', 2023, 'Pop', 'Test Artist']);
    console.log('Song created:', songId);

    // 4. Insert into playlistsongs
    const psId = `playlistsong-${nanoid(16)}`;
    console.log('Attempting to insert into playlistsongs...');
    const res = await pool.query(
      'INSERT INTO playlistsongs(id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id',
      [psId, playlistId, songId]
    );
    console.log('Insert result:', res.rows);

    // 5. Verify
    const check = await pool.query('SELECT * FROM playlistsongs WHERE id = $1', [psId]);
    console.log('Verification SELECT:', check.rows);

    if (check.rows.length > 0) {
      console.log('SUCCESS: Row found in DB.');
    } else {
      console.error('FAILURE: Row NOT found in DB.');
    }

    // Cleanup
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    // Cascade should handle the rest
    console.log('Cleanup done.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testInsert();
