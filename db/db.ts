import Database from 'bun:sqlite';

const db: Database = new Database(Bun.env.DB_FILE_PATH);

db.query(`CREATE TABLE IF NOT EXISTS "user" (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )`).run();
db.query('CREATE UNIQUE INDEX IF NOT EXISTS user_id_IDX ON "user" (id)').run();

export default db;
