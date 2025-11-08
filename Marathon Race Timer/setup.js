// setup.js
async function setupDatabase() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      runnerId TEXT NOT NULL,
      name TEXT NOT NULL,
      time TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);

  console.log('✅ Database setup complete');
  await db.close();
}

setupDatabase().catch(err => {
  console.error('❌ Error setting up database:', err);
});
