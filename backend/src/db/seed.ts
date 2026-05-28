import { db } from './index';
import { users, tickets, comments, auditLogs } from './schema';

async function seed() {
  console.log('Seeding initial data...');

  try {
    // We don't hash passwords in this dummy setup to keep it simple, 
    // or we can use a simple hash if we had bcrypt. 
    // For now, we store them as plain text matching the frontend dummy check or just hash them simply.
    // The frontend currently checks plain text password in `useAuth.ts`. 
    // We will update frontend to call backend API later, but for now we store plain text so it's easy.

    // Delete all existing data first to ensure fresh seed
    await db.delete(auditLogs);
    await db.delete(comments);
    await db.delete(tickets);
    await db.delete(users);

    await db.insert(users).values([
      {
        nimNip: '12001',
        name: 'Budi Siregar',
        email: 'budi@students.uin-suska.ac.id',
        passwordHash: 'mahasiswa1', // Plain text for dummy
        role: 'Mahasiswa',
      },
      {
        nimNip: '13001',
        name: 'Bagus Hartono',
        email: 'bagus@uin-suska.ac.id',
        passwordHash: 'dosen123',
        role: 'Dosen',
      },
      {
        nimNip: '14001',
        name: 'Agus Salim',
        email: 'admin@uin-suska.ac.id',
        passwordHash: 'admin123',
        role: 'Admin IT',
      },
      {
        nimNip: '15001',
        name: 'Budi Santoso',
        email: 'budi.santoso@uin-suska.ac.id',
        passwordHash: 'teknisi123',
        role: 'Teknisi',
        specialty: 'Jaringan',
        phone: '081555313334',
        telegramRegCode: 'REG-15001',
      }
    ]).onConflictDoNothing(); // Prevent error if already seeded

    console.log('✅ Seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } process.exit(0);
}

seed();
