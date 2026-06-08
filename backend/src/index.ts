import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { startBot, sendGroupMessage, sendGroupPhoto, onTicketResolved } from './bot';
import { db } from './db';
import { tickets, users, comments, auditLogs, articles, articleViews } from './db/schema';
import { eq, desc, asc } from 'drizzle-orm';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for Vercel production frontend & localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origin ${origin} not explicitly in allowed list, but permitting for safety.`);
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Create HTTP server to share port with WebSocket server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected. Total: ${clients.size}`);
  
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Total: ${clients.size}`);
  });
  
  ws.on('error', (err) => {
    console.error('[WS] WebSocket error:', err);
  });
});

function broadcast(data: any) {
  const payload = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Register Bot Callback to broadcast ticket resolutions
onTicketResolved((ticketId) => {
  console.log(`[WS] Broadcasting ticket resolved via bot: ${ticketId}`);
  broadcast({ event: 'tickets_updated', type: 'status_change', id: ticketId, status: 'Resolved' });
});

app.get('/', (req, res) => {
  res.send('Helpdesk Backend API is running!');
});

app.get('/api/test-route', (req, res) => {
  res.json({ message: 'Hello from test route' });
});

// Helper: Get user by NIM/NIP
async function getUserByNimNip(nimNip: string) {
  return await db.query.users.findFirst({
    where: eq(users.nimNip, nimNip)
  });
}

// 1. GET ALL TICKETS
app.get('/api/tickets', async (req, res) => {
  try {
    const allTickets = await db.query.tickets.findMany({
      orderBy: [desc(tickets.createdAt)],
      with: {
        requester: true,
        assignee: true,
        comments: {
          with: { author: true },
          orderBy: [asc(comments.createdAt)]
        },
        auditLogs: {
          with: { user: true },
          orderBy: [desc(auditLogs.createdAt)]
        }
      }
    });
    res.json(allTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// 2. CREATE TICKET
app.post('/api/tickets', async (req, res) => {
  try {
    const { title, description, category, priority, location, requesterNimNip, attachmentBase64 } = req.body;
    
    const requester = await getUserByNimNip(requesterNimNip);
    if (!requester) {
      return res.status(404).json({ error: 'Requester not found' });
    }

    // Generate Ticket ID (#1001)
    const existingTickets = await db.query.tickets.findMany();
    const ids = existingTickets.map(t => parseInt(t.id.replace('#', ''), 10)).filter(n => !isNaN(n));
    const nextId = ids.length > 0 ? `#${Math.max(...ids) + 1}` : '#1001';

    // Calculate SLA
    const hours = priority === 'High' ? 4 : priority === 'Medium' ? 8 : 24;
    const slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);

    const newTicket = {
      id: nextId,
      title,
      description,
      category,
      priority,
      status: 'Open',
      location,
      requesterId: requester.id,
      slaDeadline,
      attachmentUrl: attachmentBase64 || null,
    };

    await db.insert(tickets).values(newTicket);

    await db.insert(auditLogs).values({
      ticketId: nextId,
      userId: requester.id,
      action: `Tiket dibuat oleh ${requester.name} (${requester.nimNip})`
    });

    // Kirim notifikasi ke Telegram
    const notifMessage = `🚨 *TIKET BARU MASUK: ${nextId}* 🚨\n\n` +
      `*Judul:* ${title}\n` +
      `*Kategori:* ${category}\n` +
      `*Prioritas:* ${priority}\n` +
      `*Lokasi:* ${location}\n` +
      `*Pelapor:* ${requester.name}\n\n` +
      `*Deskripsi:*\n${description}\n\n` +
      `Admin, mohon segera ditugaskan ke Teknisi melalui portal IT Helpdesk.`;

    if (attachmentBase64) {
      // Decode Base64 to Buffer
      const base64Data = attachmentBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      await sendGroupPhoto(buffer, notifMessage);
    } else {
      await sendGroupMessage(notifMessage);
    }
    broadcast({ event: 'tickets_updated', type: 'create', id: nextId });
    res.json({ success: true, ticketId: nextId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// 3. CHANGE STATUS
app.put('/api/tickets/:id/status', async (req, res) => {
  try {
    const { status, byNimNip } = req.body;
    const ticketId = req.params.id;

    const user = await getUserByNimNip(byNimNip);
    
    await db.update(tickets)
      .set({ status, updatedAt: new Date() })
      .where(eq(tickets.id, ticketId));

    if (user) {
      await db.insert(auditLogs).values({
        ticketId,
        userId: user.id,
        action: `Status diubah menjadi ${status}`
      });
    }

    broadcast({ event: 'tickets_updated', type: 'status_change', id: ticketId, status });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change status' });
  }
});

// 4. ASSIGN TICKET
app.put('/api/tickets/:id/assign', async (req, res) => {
  try {
    const { assigneeName, byNimNip, notes } = req.body;
    const ticketId = req.params.id;

    // Find technician by name (simplification for dummy data)
    const technician = await db.query.users.findFirst({
      where: eq(users.name, assigneeName)
    });

    if (!technician) return res.status(404).json({ error: 'Technician not found' });

    // Find existing ticket to check for reassign
    const oldTicket = await db.query.tickets.findFirst({ 
      where: eq(tickets.id, ticketId),
      with: { assignee: true }
    });

    const isReassign = oldTicket?.assignedToId && oldTicket.assignedToId !== technician.id;
    const oldAssigneeName = isReassign && oldTicket.assignee ? oldTicket.assignee.name : null;

    const adminUser = await getUserByNimNip(byNimNip);

    await db.update(tickets)
      .set({ assignedToId: technician.id, status: 'In Progress', updatedAt: new Date() })
      .where(eq(tickets.id, ticketId));

    if (adminUser) {
      await db.insert(auditLogs).values({
        ticketId,
        userId: adminUser.id,
        action: `Tiket di-assign ke ${technician.name}${notes ? ` — Catatan: ${notes}` : ''}`
      });
    }

    // Get Ticket info for Bot
    const ticket = await db.query.tickets.findFirst({ where: eq(tickets.id, ticketId) });
    
    // SEND TELEGRAM MESSAGE TO GROUP
    if (ticket) {
      const headerTitle = isReassign ? `TUGAS DIALIHKAN (REASSIGN): ${ticket.id}` : `TUGAS BARU: ${ticket.id}`;
      const message = `🚨 *${headerTitle}* 🚨\n\n` +
        `*Judul:* ${ticket.title}\n` +
        `*Kategori:* ${ticket.category}\n` +
        `*Prioritas:* ${ticket.priority}\n` +
        `*Lokasi:* ${ticket.location}\n\n` +
        `*Ditugaskan Kepada:* ${technician.name} ${technician.phone ? `(${technician.phone})` : ''}\n` +
        (isReassign ? `*Peralihan Dari:* ${oldAssigneeName}\n` : '') +
        `${notes ? `*Catatan Admin:* ${notes}\n\n` : '\n'}` +
        `Mohon segera ditindaklanjuti. Jika sudah selesai, klik atau balas dengan:\n` +
        `\`/done ${ticket.id.replace('#', '')}\``;

      await sendGroupMessage(message);
    }

    broadcast({ event: 'tickets_updated', type: 'assign', id: ticketId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

// 5. ADD COMMENT
app.post('/api/tickets/:id/comments', async (req, res) => {
  try {
    const { message, authorNimNip } = req.body;
    const ticketId = req.params.id;

    const author = await getUserByNimNip(authorNimNip);
    if (!author) return res.status(404).json({ error: 'User not found' });

    await db.insert(comments).values({
      ticketId,
      authorId: author.id,
      message
    });

    await db.update(tickets).set({ updatedAt: new Date() }).where(eq(tickets.id, ticketId));

    broadcast({ event: 'tickets_updated', type: 'comment_add', id: ticketId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// 6. MARK AS INCIDENT
app.put('/api/tickets/:id/incident', async (req, res) => {
  try {
    const { incidentNotes, byNimNip } = req.body;
    const ticketId = req.params.id;

    const admin = await getUserByNimNip(byNimNip);

    await db.update(tickets)
      .set({ isIncident: true, incidentNotes, updatedAt: new Date() })
      .where(eq(tickets.id, ticketId));

    if (admin) {
      await db.insert(auditLogs).values({
        ticketId,
        userId: admin.id,
        action: 'Tiket ditandai sebagai Incident'
      });
    }

    broadcast({ event: 'tickets_updated', type: 'incident', id: ticketId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as incident' });
  }
});

// 7. GET USERS (STAFF)
app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      where: (u, { inArray }) => inArray(u.role, ['Teknisi', 'Admin IT'])
    });
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 8. ADD USER (STAFF)
app.post('/api/users', async (req, res) => {
  try {
    const { nimNip, name, email, passwordHash, role, specialty, phone } = req.body;
    
    // Generate reg code if Teknisi
    let telegramRegCode = undefined;
    if (role === 'Teknisi') {
      telegramRegCode = 'REG-' + nimNip;
    }

    await db.insert(users).values({
      nimNip,
      name,
      email,
      passwordHash,
      role,
      specialty,
      phone,
      telegramRegCode
    });

    broadcast({ event: 'users_updated' });
    res.json({ success: true, telegramRegCode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// 8b. DELETE USER (STAFF)
app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id; // user id is uuid string, not integer
    
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Set assignedToId to null for all tickets assigned to this user
    await db.update(tickets)
      .set({ assignedToId: null })
      .where(eq(tickets.assignedToId, userId));

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    broadcast({ event: 'users_updated' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 8c. GET ALL ARTICLES
app.get('/api/articles', async (req, res) => {
  try {
    const { category, status } = req.query;
    
    const allArticles = await db.query.articles.findMany({
      where: (art, { eq, and }) => {
        const conds = [];
        if (category && category !== 'Semua' && category !== 'all') {
          conds.push(eq(art.category, category as string));
        }
        if (status) {
          conds.push(eq(art.status, status as string));
        }
        return conds.length > 0 ? and(...conds) : undefined;
      },
      orderBy: [desc(articles.createdAt)],
      with: {
        author: true,
        relatedIncident: true,
      }
    });
    res.json(allArticles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// 8d. GET SINGLE ARTICLE
app.get('/api/articles/:id', async (req, res) => {
  try {
    const articleId = req.params.id;
    const { userNimNip } = req.query;
    
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
      with: {
        author: true,
        relatedIncident: true
      }
    });
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    let currentViews = article.views;
    
    // 1 account 1x view logic
    if (userNimNip) {
      const user = await getUserByNimNip(userNimNip as string);
      if (user) {
        // Check if this user has viewed this article before
        const existingView = await db.query.articleViews.findFirst({
          where: (av, { and, eq }) => and(
            eq(av.articleId, articleId),
            eq(av.userId, user.id)
          )
        });
        
        if (!existingView) {
          // Record view in database
          await db.insert(articleViews).values({
            articleId,
            userId: user.id
          });
          
          // Increment views in article table
          currentViews += 1;
          await db.update(articles)
            .set({ views: currentViews })
            .where(eq(articles.id, articleId));
        }
      }
    }
      
    res.json({ ...article, views: currentViews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// 8e. CREATE ARTICLE
app.post('/api/articles', async (req, res) => {
  try {
    const { title, content, category, tags, relatedIncidentId, status, coverImage, authorNimNip } = req.body;
    const author = await getUserByNimNip(authorNimNip);
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    const newArticle = {
      title,
      content,
      category,
      tags: tags || null,
      relatedIncidentId: relatedIncidentId || null,
      status: status || 'Draft',
      coverImage: coverImage || null,
      authorId: author.id,
      views: 0,
    };
    
    const [inserted] = await db.insert(articles).values(newArticle).returning();
    broadcast({ event: 'articles_updated', type: 'create', id: inserted.id });
    res.json({ success: true, article: inserted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// 8f. UPDATE ARTICLE
app.put('/api/articles/:id', async (req, res) => {
  try {
    const articleId = req.params.id;
    const { title, content, category, tags, relatedIncidentId, status, coverImage } = req.body;
    
    const existing = await db.query.articles.findFirst({
      where: eq(articles.id, articleId)
    });
    if (!existing) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    await db.update(articles)
      .set({
        title,
        content,
        category,
        tags: tags || null,
        relatedIncidentId: relatedIncidentId || null,
        status: status || existing.status,
        coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId));
      
    broadcast({ event: 'articles_updated', type: 'update', id: articleId });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// 8g. DELETE ARTICLE
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const articleId = req.params.id;
    const existing = await db.query.articles.findFirst({
      where: eq(articles.id, articleId)
    });
    if (!existing) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    await db.delete(articles).where(eq(articles.id, articleId));
    broadcast({ event: 'articles_updated', type: 'delete', id: articleId });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// 8h. GET INCIDENTS
app.get('/api/incidents', async (req, res) => {
  try {
    const allIncidents = await db.query.tickets.findMany({
      where: eq(tickets.isIncident, true),
      orderBy: [desc(tickets.updatedAt)],
      with: {
        requester: true,
        assignee: true,
      }
    });
    res.json(allIncidents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// 9. PERFORMANCE METRICS
app.get('/api/performance', async (req, res) => {
  try {
    const allTickets = await db.query.tickets.findMany();
    const allLogs = await db.query.auditLogs.findMany({
      with: { user: true, ticket: true }
    });
    const allStaff = await db.query.users.findMany({
      where: (u, { inArray }) => inArray(u.role, ['Teknisi', 'Admin IT'])
    });

    console.log('ALL STAFF:', allStaff.map(s => ({ name: s.name, role: s.role })));

    const adminPerformance = [];
    const technicianPerformance = [];
    
    for (const staff of allStaff) {
      if (staff.role === 'Admin IT') {
        const myLogs = allLogs.filter(l => l.userId === staff.id);
        const uniqueTicketIds = Array.from(new Set(myLogs.map(l => l.ticketId).filter(Boolean)));
        const handledTickets = allTickets.filter(t => uniqueTicketIds.includes(t.id));
        
        let totalResponseSec = 0;
        let respondedCount = 0;
        let totalResolutionSec = 0;
        let resolvedCount = 0;
        let slaMet = 0;

        handledTickets.forEach(t => {
          // Cari log pertama oleh admin ini untuk tiket tsb
          const firstAdminLog = myLogs.filter(l => l.ticketId === t.id).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
          if (firstAdminLog) {
            totalResponseSec += Math.max(0, (firstAdminLog.createdAt.getTime() - t.createdAt.getTime()) / 1000);
            respondedCount++;
          }
          if (t.status === 'Resolved' || t.status === 'Closed') {
             totalResolutionSec += Math.max(0, (t.updatedAt.getTime() - t.createdAt.getTime()) / 1000);
             resolvedCount++;
             if (t.updatedAt <= t.slaDeadline) slaMet++;
          }
        });

        const avgRespSec = respondedCount > 0 ? totalResponseSec / respondedCount : 0;
        const avgResSec = resolvedCount > 0 ? totalResolutionSec / resolvedCount : 0;
        const slaCompliance = resolvedCount > 0 ? Math.round((slaMet / resolvedCount) * 100) : 100;

        adminPerformance.push({
          id: staff.id,
          name: staff.name,
          role: staff.role,
          ticketsHandled: uniqueTicketIds.length,
          activitiesLogged: myLogs.length,
          avgResponseTime: avgRespSec > 0 ? (avgRespSec / 3600).toFixed(1) + ' jam' : '-',
          avgResolutionTime: avgResSec > 0 ? (avgResSec / 3600).toFixed(1) + ' jam' : '-',
          slaCompliance,
          rating: slaCompliance >= 95 ? 'Excellent' : slaCompliance >= 80 ? 'Good' : 'Needs Improvement'
        });
      } else if (staff.role === 'Teknisi') {
        const assigned = allTickets.filter(t => t.assignedToId === staff.id);
        const completed = assigned.filter(t => t.status === 'Resolved' || t.status === 'Closed');
        
        let slaMet = 0;
        let totalTimeSec = 0;
        completed.forEach(t => {
          if (t.updatedAt <= t.slaDeadline) slaMet++;
          const diffSec = (t.updatedAt.getTime() - t.createdAt.getTime()) / 1000;
          totalTimeSec += Math.max(0, diffSec);
        });

        const slaCompliance = completed.length > 0 ? Math.round((slaMet / completed.length) * 100) : 100;
        const avgSec = completed.length > 0 ? totalTimeSec / completed.length : 0;
        const avgHours = (avgSec / 3600).toFixed(1) + ' jam';

        technicianPerformance.push({
          id: staff.id,
          name: staff.name,
          role: staff.role,
          specialty: staff.specialty || '-',
          assignedTickets: assigned.length,
          completedTickets: completed.length,
          avgCompletionTime: avgHours,
          slaCompliance,
          rating: slaCompliance >= 95 ? 'Excellent' : 'Good'
        });
      }
    }

    // Daily Logs
    const dailyLogsMap = new Map();
    allLogs.forEach(log => {
      // Hanya tampilkan log untuk Admin IT dan Teknisi
      if (log.user?.role !== 'Admin IT' && log.user?.role !== 'Teknisi') return;

      const dateStr = log.createdAt.toISOString().split('T')[0];
      const timeStr = log.createdAt.toISOString().split('T')[1].substring(0, 5);
      const key = `${dateStr}_${log.userId}`;
      if (!dailyLogsMap.has(key)) {
        dailyLogsMap.set(key, {
          date: dateStr,
          staffName: log.user?.name,
          role: log.user?.role,
          activities: [],
          summary: { totalActivities: 0, ticketsHandled: 0, ticketsResolved: 0 }
        });
      }
      const entry = dailyLogsMap.get(key);
      entry.activities.push({
        time: timeStr,
        action: log.action,
        ticketId: log.ticketId
      });
      entry.summary.totalActivities++;
      
      // Calculate handled/resolved for summary
      if (log.action.includes('di-assign') || log.action.includes('Assign') || log.ticketId) {
        entry.summary.ticketsHandled++;
      }
      if (log.action.includes('Resolved') || log.action.includes('diselesaikan')) {
        entry.summary.ticketsResolved++;
      }
    });
    
    // Sort descending by date
    const dailyLogs = Array.from(dailyLogsMap.values()).sort((a: any, b: any) => b.date.localeCompare(a.date));

    res.json({
      adminPerformance,
      technicianPerformance,
      dailyLogs
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to compute performance' });
  }
});

async function seedDatabase() {
  try {
    const userList = await db.select().from(users);
    if (userList.length === 0) {
      console.log('🌱 Database is empty. Seeding default dummy users...');
      
      const seedUsers = [
        {
          nimNip: '12001',
          name: 'Budi Siregar',
          email: 'budi.siregar@student.uin-suska.ac.id',
          passwordHash: 'mahasiswa1',
          role: 'Mahasiswa',
          phone: '081234567801'
        },
        {
          nimNip: '13001',
          name: 'Bagus Hartono',
          email: 'bagus.hartono@uin-suska.ac.id',
          passwordHash: 'dosen123',
          role: 'Dosen',
          phone: '081234567802'
        },
        {
          nimNip: '14001',
          name: 'Agus Salim',
          email: 'agus.salim@uin-suska.ac.id',
          passwordHash: 'admin123',
          role: 'Admin IT',
          phone: '081234567803'
        },
        {
          nimNip: '15001',
          name: 'Roni Wijaya',
          email: 'roni.wijaya@uin-suska.ac.id',
          passwordHash: 'teknisi123',
          role: 'Teknisi',
          specialty: 'Jaringan',
          phone: '081234567804',
          telegramRegCode: 'REG-15001'
        },
        {
          nimNip: '15002',
          name: 'Doni Setiawan',
          email: 'doni.setiawan@uin-suska.ac.id',
          passwordHash: 'teknisi123',
          role: 'Teknisi',
          specialty: 'Perangkat',
          phone: '081234567805',
          telegramRegCode: 'REG-15002'
        }
      ];

      for (const u of seedUsers) {
        await db.insert(users).values(u);
      }
      console.log('✅ Seeding users completed successfully!');
    }

    // Seed default articles if empty
    const articleList = await db.select().from(articles);
    if (articleList.length === 0) {
      console.log('🌱 Seeding default dummy articles...');
      const adminUser = await db.query.users.findFirst({
        where: eq(users.role, 'Admin IT')
      });
      if (adminUser) {
        const seedArticles = [
          {
            title: 'Cara mengatasi tidak bisa connect ke WiFi kampus',
            content: `Berikut adalah langkah-langkah troubleshooting jika Anda mengalami kendala saat menghubungkan perangkat ke WiFi kampus:

1. **Pastikan Wi-Fi Aktif**: Periksa tombol fisik atau pengaturan software pada perangkat Anda untuk memastikan Wi-Fi dalam keadaan aktif.
2. **Forget Network**: Hapus jaringan wifi lama 'Univ-WiFi' dari daftar jaringan tersimpan, lalu coba hubungkan kembali.
3. **Gunakan Akun iRaise**: Masukkan username dan password iRaise Anda dengan benar. NIM untuk mahasiswa, dan NIP untuk dosen/pegawai.
4. **Sertifikat Keamanan**: Jika muncul peringatan keamanan sertifikat (Certificate Trust), klik 'Trust' atau 'Terima' untuk melanjutkan koneksi.
5. **Daftarkan Perangkat**: Pastikan perangkat Anda sudah didaftarkan pada portal IT Helpdesk jika sistem mewajibkan registrasi MAC address.

Jika langkah-langkah di atas belum menyelesaikan masalah, silakan ajukan tiket bantuan ke IT Helpdesk agar tim teknisi kami dapat melakukan pengecekan lebih lanjut.`,
            category: 'Jaringan',
            tags: 'WiFi, Network, Connection',
            status: 'Published',
            views: 1254,
            authorId: adminUser.id,
          },
          {
            title: 'Reset password akun iRaise secara mandiri',
            content: `Lupa password akun iRaise Anda? Berikut cara melakukan reset secara mandiri dengan cepat:

1. Buka halaman portal login iRaise di browser Anda.
2. Klik link **"Lupa Password?"** atau **"Reset Password"** di bawah tombol login.
3. Masukkan NIM (Mahasiswa) atau NIP (Dosen/Pegawai) Anda serta alamat email alternatif yang terdaftar di sistem.
4. Periksa kotak masuk email Anda (termasuk folder spam jika tidak ada di inbox). Buka email verifikasi dari sistem dan klik link reset password.
5. Masukkan password baru Anda yang kuat (minimal 8 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol).
6. Selesai! Anda kini bisa login menggunakan password baru tersebut.

*Catatan: Jika email alternatif Anda tidak aktif atau tidak terdaftar, Anda harus mengunjungi kantor IT Helpdesk dengan membawa KTM/KTP untuk verifikasi identitas secara langsung.*`,
            category: 'Akun',
            tags: 'Password, Account, iRaise',
            status: 'Published',
            views: 892,
            authorId: adminUser.id,
          },
          {
            title: 'Panduan troubleshooting perangkat laptop tidak terdeteksi',
            content: `Jika laptop Anda tidak terdeteksi atau tidak mendapatkan IP Address dari jaringan kabel/LAN kampus:

1. **Periksa Kabel LAN**: Pastikan kabel LAN terpasang dengan erat pada port RJ45 di laptop Anda dan di wall outlet ruangan.
2. **Restart Network Adapter**: Masuk ke Control Panel -> Network and Internet -> Network Connections. Klik kanan pada Ethernet adapter Anda, pilih Disable, tunggu beberapa detik, lalu klik Enable kembali.
3. **Atur IP ke DHCP**: Pastikan pengaturan IP address dan DNS server diatur ke otomatis (Obtain an IP address automatically).
4. **Daftarkan MAC Address**: Masuk ke portal IT Support, daftarkan MAC address Ethernet laptop Anda.
5. **Coba Kabel/Port Lain**: Jika memungkinkan, coba gunakan kabel LAN lain atau hubungkan ke port wall outlet yang berbeda untuk memastikan letak kerusakannya.`,
            category: 'Perangkat',
            tags: 'Laptop, Network, Hardware',
            status: 'Published',
            views: 643,
            authorId: adminUser.id,
          },
          {
            title: 'Konfigurasi VPN untuk akses jarak jauh (Work from Home)',
            content: `Panduan ini ditujukan untuk dosen dan staf yang perlu mengakses server internal kampus atau aplikasi repositori dari luar area kampus:

1. Unduh aplikasi client VPN resmi yang disediakan IT Support.
2. Install aplikasi tersebut di perangkat komputer atau laptop Anda.
3. Jalankan aplikasi, kemudian masukkan alamat server VPN kampus: \`vpn.uin-suska.ac.id\`.
4. Masukkan username dan password akun pegawai Anda.
5. Tekan tombol **Connect**. Setelah status berubah menjadi Connected, Anda sudah bisa mengakses sistem akademik internal seperti biasa.

*Penting: Selalu putuskan koneksi VPN (Disconnect) jika Anda sudah selesai bekerja untuk menjaga keamanan jaringan internal kampus.*`,
            category: 'Jaringan',
            tags: 'VPN, Remote Access, Security',
            status: 'Draft',
            views: 0,
            authorId: adminUser.id,
          }
        ];
        for (const a of seedArticles) {
          await db.insert(articles).values(a);
        }
        console.log('✅ Seeding articles completed successfully!');
      }
    }
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
  }
}

// Start HTTP and WebSocket Server
server.listen(port, async () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
  
  // Seed database with dummy accounts if empty
  await seedDatabase();
  
  // Start Telegram Bot
  startBot();
});
