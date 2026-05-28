import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { db } from '../db';
import { tickets, auditLogs, users } from '../db/schema';
import { eq } from 'drizzle-orm';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// Command to get group ID
bot.command('setup', (ctx) => {
  const chatId = ctx.chat.id;
  ctx.reply(`✅ Setup berhasil!\n\nID Chat ini adalah: \`${chatId}\`\n\nSilakan copy ID di atas dan masukkan ke dalam file \`.env\` di variabel \`TELEGRAM_GROUP_ID\`.`, { parse_mode: 'Markdown' });
  console.log(`[BOT SETUP] Group Chat ID: ${chatId}`);
});

// Command for technician to resolve a ticket
bot.command('done', async (ctx) => {
  // Only allow in group if needed, or anywhere
  const message = ctx.message.text; // e.g., "/done 1001"
  const args = message.split(' ');
  
  if (args.length < 2) {
    return ctx.reply('❌ Format salah! Gunakan: /done <ID_TIKET>\nContoh: /done 1001');
  }

  let ticketId = args[1];
  if (!ticketId.startsWith('#')) {
    ticketId = '#' + ticketId;
  }

  try {
    // Check if ticket exists
    const existingTicket = await db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId)
    });

    if (!existingTicket) {
      return ctx.reply(`❌ Tiket ${ticketId} tidak ditemukan.`);
    }

    if (existingTicket.status === 'Resolved' || existingTicket.status === 'Closed') {
      return ctx.reply(`⚠️ Tiket ${ticketId} sudah berstatus ${existingTicket.status}.`);
    }

    // Check if user is registered and authorized
    const telegramUserId = ctx.from?.id.toString();
    const commandUser = await db.query.users.findFirst({
      where: eq(users.telegramChatId, telegramUserId || '')
    });

    if (!commandUser) {
      return ctx.reply('❌ Akun Telegram Anda belum terdaftar di sistem. Gunakan /daftar <KODE> terlebih dahulu.');
    }

    if (commandUser.role === 'Teknisi' && existingTicket.assignedToId !== commandUser.id) {
      return ctx.reply(`❌ Anda tidak memiliki izin untuk menyelesaikan tiket ini. Tiket ditugaskan ke teknisi lain.`);
    }

    // Update ticket status
    await db.update(tickets)
      .set({ status: 'Resolved', updatedAt: new Date() })
      .where(eq(tickets.id, ticketId));

    await db.insert(auditLogs).values({
      ticketId: ticketId,
      userId: commandUser.id,
      action: `Status diubah menjadi Resolved oleh ${commandUser.name} via Telegram`,
    });

    ctx.reply(`✅ *Tiket ${ticketId} berhasil diselesaikan!*\nTerima kasih, ${commandUser.name}.`, { parse_mode: 'Markdown' });
    if (onTicketResolvedCallback) {
      try {
        onTicketResolvedCallback(ticketId);
      } catch (err) {
        console.error('[BOT CALLBACK ERROR]', err);
      }
    }

  } catch (error) {
    console.error('[BOT ERROR]', error);
    ctx.reply('❌ Terjadi kesalahan saat mengupdate tiket di database.');
  }
});

// Command for technician to bind their telegram account
bot.command('daftar', async (ctx) => {
  const message = ctx.message.text; // e.g., "/daftar REG-15001"
  const args = message.split(' ');
  
  if (args.length < 2) {
    return ctx.reply('❌ Format salah! Gunakan: /daftar <KODE_REGISTRASI>\nContoh: /daftar REG-15001');
  }

  const regCode = args[1];
  const telegramUserId = ctx.from?.id.toString();

  if (!telegramUserId) return ctx.reply('❌ Tidak dapat mengidentifikasi ID Telegram Anda.');

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.telegramRegCode, regCode)
    });

    if (!existingUser) {
      return ctx.reply('❌ Kode registrasi tidak valid atau tidak ditemukan.');
    }

    if (existingUser.telegramChatId) {
      return ctx.reply(`⚠️ Akun ${existingUser.name} sudah terhubung dengan Telegram.`);
    }

    // Update user with telegramChatId
    await db.update(users)
      .set({ telegramChatId: telegramUserId })
      .where(eq(users.telegramRegCode, regCode));

    ctx.reply(`✅ *Registrasi Berhasil!*\nAkun Telegram ini telah terhubung dengan data pegawai:\n\nNama: ${existingUser.name}\nPeran: ${existingUser.role}\n\nAnda sekarang akan menerima notifikasi tiket langsung dari bot ini.`, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('[BOT ERROR]', error);
    ctx.reply('❌ Terjadi kesalahan saat registrasi.');
  }
});

let onTicketResolvedCallback: ((ticketId: string) => void) | null = null;
export const onTicketResolved = (cb: (ticketId: string) => void) => {
  onTicketResolvedCallback = cb;
};

export const startBot = () => {
  bot.launch();
  console.log('🤖 Telegram Bot is running...');
};

export const sendGroupMessage = async (message: string) => {
  const groupId = process.env.TELEGRAM_GROUP_ID;
  if (!groupId) {
    console.warn('⚠️ TELEGRAM_GROUP_ID tidak diset di .env. Pesan tidak dikirim.');
    return;
  }
  try {
    await bot.telegram.sendMessage(groupId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('❌ Gagal mengirim pesan ke grup Telegram:', error);
  }
};

export const sendGroupPhoto = async (buffer: Buffer, caption: string) => {
  const groupId = process.env.TELEGRAM_GROUP_ID;
  if (!groupId) return;
  try {
    await bot.telegram.sendPhoto(groupId, { source: buffer }, { caption, parse_mode: 'Markdown' });
  } catch (error) {
    console.error('❌ Gagal mengirim foto ke grup Telegram:', error);
    await sendGroupMessage(caption);
  }
};

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
