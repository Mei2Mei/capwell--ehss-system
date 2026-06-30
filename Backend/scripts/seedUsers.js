const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seedUsers() {
  const password = await bcrypt.hash('Capwell2026!', 10);

  const users = [
    { full_name: 'Linda Wanaswa', email: 'linda@capwell.com', role_id: 1 },        // ehss_officer
    { full_name: 'Collins Bitok', email: 'collins@capwell.com', role_id: 6 },   // it_admin
    { full_name: 'QA Worker', email: 'qa@capwell.com', role_id: 5 },             // qa
    { full_name: 'Storekeeper', email: 'storekeeper@capwell.com', role_id: 2 },  // storekeeper
    { full_name: 'Department Supervisor', email: 'supervisor@capwell.com', role_id: 3 },    // supervisor
    { full_name: 'Production Manager', email: 'pm@capwell.com', role_id: 4 },    // production_manager
  ];

  for (const user of users) {
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = $3, role_id = $4`,
      [user.full_name, user.email, password, user.role_id]
    );
    console.log(`✓ Seeded: ${user.email}`);
  }

  console.log('All users seeded successfully.');
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});