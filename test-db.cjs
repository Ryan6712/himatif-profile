// tes-db.cjs
const mysql = require('mysql2/promise');
require('dotenv').config()

async function test() {
  try {
    console.log('Mencoba koneksi MySQL ke Aiven...');
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD, // ganti dengan password Anda
      database: process.env.DATABASE_NAME,            // ganti dengan nama database Anda
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ BERHASIL TERHUBUNG KE MYSQL AIVEN!');
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('Hasil query:', rows);
    await connection.end();
  } catch (err) {
    console.error('❌ Gagal query:', err.message);
  }
}

test();