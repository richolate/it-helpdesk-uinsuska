import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useNotificationStore } from '@/stores/useNotificationStore'

// ─── Types ───────────────────────────────────────────────────────────────────

export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed'
export type TicketPriority = 'High' | 'Medium' | 'Low'
export type TicketCategory =
  | 'Jaringan'
  | 'iRaise'
  | 'Akun'
  | 'Perangkat'
  | 'Software'
  | 'Infrastruktur'
  | 'Lainnya'

export interface Comment {
  author: string
  role: string
  message: string
  time: string
}

export interface AuditEntry {
  time: string
  user: string
  action: string
}

export interface TimelineEntry {
  status: TicketStatus
  date: string
  active: boolean
}

export interface Ticket {
  id: string
  title: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  description: string
  location: string

  requesterNimNip: string
  requesterNama: string
  requesterEmail: string
  requesterPhone?: string

  assignedTo: string | null

  createdAt: string
  updatedAt: string
  slaDeadline: string

  comments: Comment[]
  auditLog: AuditEntry[]
  timeline: TimelineEntry[]

  isIncident: boolean
  incidentNotes?: string
  attachments?: {url: string}[]
}

// ─── API Base URL & WebSocket URL ────────────────────────────────────────────
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  if (!iso || iso === '-') return '-'
  // Hapus 'Z' jika ada, agar browser menganggapnya sebagai waktu lokal (mencegah penambahan +7 jam dua kali)
  const safeIso = iso.replace('Z', '')
  const d = new Date(safeIso)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateShort(iso: string): string {
  if (!iso || iso === '-') return '-'
  const safeIso = iso.replace('Z', '')
  const d = new Date(safeIso)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildTimeline(createdAt: string, currentStatus: string, auditLogs: any[]): TimelineEntry[] {
  const statuses: TicketStatus[] = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];
  
  // Try to find status change dates from audit logs
  return statuses.map((s, i) => {
    let date = '-';
    if (s === 'Open') date = createdAt;
    else {
      const log = auditLogs.find(l => l.action.includes(`ke ${s}`) || l.action.includes(`menjadi ${s}`));
      if (log) date = log.createdAt || log.time;
      else if (s === currentStatus) date = new Date().toISOString(); // Fallback if log is missing
    }
    
    return {
      status: s,
      date,
      active: s === currentStatus,
    }
  });
}

function mapBackendToFrontend(dbTicket: any): Ticket {
  return {
    id: dbTicket.id,
    title: dbTicket.title,
    category: dbTicket.category,
    priority: dbTicket.priority,
    status: dbTicket.status,
    description: dbTicket.description,
    location: dbTicket.location,
    requesterNimNip: dbTicket.requester?.nimNip || '',
    requesterNama: dbTicket.requester?.name || '',
    requesterEmail: dbTicket.requester?.email || '',
    requesterPhone: dbTicket.requester?.phone || undefined,
    assignedTo: dbTicket.assignee?.name || null,
    createdAt: dbTicket.createdAt,
    updatedAt: dbTicket.updatedAt,
    slaDeadline: dbTicket.slaDeadline,
    isIncident: dbTicket.isIncident,
    incidentNotes: dbTicket.incidentNotes || undefined,
    comments: (dbTicket.comments || []).map((c: any) => ({
      author: c.author?.name || 'Unknown',
      role: c.author?.role || 'Unknown',
      message: c.message,
      time: c.createdAt
    })),
    auditLog: (dbTicket.auditLogs || []).map((l: any) => ({
      time: l.createdAt,
      user: l.user?.name || 'System',
      action: l.action
    })),
    timeline: buildTimeline(dbTicket.createdAt, dbTicket.status, dbTicket.auditLogs || []),
    attachments: dbTicket.attachmentUrl ? [{url: dbTicket.attachmentUrl}] : []
  };
}


// ─── Store ────────────────────────────────────────────────────────────────────

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([])
  const isLoading = ref(false)

  // ─── API Actions ────────────────────────────────────────────────────────

  async function fetchTickets(silent = false) {
    if (!silent) isLoading.value = true;
    try {
      const res = await fetch(`${API_URL}/tickets`);
      const data = await res.json();
      const newTickets = data.map(mapBackendToFrontend);
      
      // Deteksi notifikasi jika bukan fetch pertama
      if (silent && tickets.value.length > 0) {
        const notifStore = useNotificationStore();
        
        // Cek tiket baru
        if (newTickets.length > tickets.value.length) {
          const added = newTickets.length - tickets.value.length;
          notifStore.addNotification({
            title: 'Tiket Baru Masuk',
            message: `Terdapat ${added} tiket baru yang masuk ke dalam antrean.`,
            type: 'info'
          });
        }
        
        // Cek tiket selesai / update komentar
        newTickets.forEach((nt: Ticket) => {
          const ot = tickets.value.find(t => t.id === nt.id);
          if (ot) {
            // Tiket berubah jadi Selesai
            if (nt.status === 'Resolved' && ot.status !== 'Resolved') {
              notifStore.addNotification({
                title: 'Tiket Selesai',
                message: `Tiket ${nt.id} telah diselesaikan oleh Teknisi.`,
                type: 'success'
              });
            }
            // Komentar bertambah
            if (nt.comments.length > ot.comments.length) {
              notifStore.addNotification({
                title: 'Pesan Baru',
                message: `Ada pesan baru pada tiket ${nt.id}.`,
                type: 'info'
              });
            }
          }
        });
      }

      tickets.value = newTickets;
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      if (!silent) isLoading.value = false;
    }
  }
  
  let pollingInterval: number | null = null;
  function startPolling() {
    if (pollingInterval) return;
    pollingInterval = window.setInterval(() => {
      fetchTickets(true); // silent fetch
    }, 10000); // 10 seconds
  }
  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  // ─── Getters (computed) ──────────────────────────────────────────────────

  function getTicketsByUser(nimNip: string): Ticket[] {
    return tickets.value.filter((t) => t.requesterNimNip === nimNip)
  }

  function getRecentTicketsByUser(nimNip: string, limit = 3): Ticket[] {
    return getTicketsByUser(nimNip)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  function getUserStats(nimNip: string) {
    const userTickets = getTicketsByUser(nimNip)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return {
      active: userTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length,
      inProgress: userTickets.filter((t) => t.status === 'In Progress').length,
      resolvedLast30: userTickets.filter(
        (t) => t.status === 'Resolved' && new Date(t.updatedAt) >= thirtyDaysAgo,
      ).length,
      total: userTickets.length,
    }
  }

  const allTickets = computed(() =>
    tickets.value
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  )

  const urgentTickets = computed(() =>
    tickets.value.filter(
      (t) => t.priority === 'High' && t.status !== 'Resolved' && t.status !== 'Closed',
    ),
  )

  const adminStats = computed(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return {
      active: tickets.value.filter(
        (t) => t.status !== 'Resolved' && t.status !== 'Closed',
      ).length,
      resolvedToday: tickets.value.filter(
        (t) => t.status === 'Resolved' && new Date(t.updatedAt) >= todayStart,
      ).length,
      slaWarning: tickets.value.filter((t) => {
        if (t.status === 'Resolved' || t.status === 'Closed') return false
        const remaining = new Date(t.slaDeadline).getTime() - now.getTime()
        return remaining > 0 && remaining < 2 * 60 * 60 * 1000
      }).length,
      slaBreach: tickets.value.filter((t) => {
        if (t.status === 'Resolved' || t.status === 'Closed') return false
        return new Date(t.slaDeadline) < now
      }).length,
    }
  })

  // ─── Mutations via API ───────────────────────────────────────────────────

  async function submitTicket(payload: any): Promise<string> {
    const res = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    await fetchTickets(); // Refresh list
    return data.ticketId;
  }

  async function addComment(ticketId: string, comment: any, authorNimNip: string) {
    await fetch(`${API_URL}/tickets/${encodeURIComponent(ticketId)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: comment.message, authorNimNip })
    });
    await fetchTickets();
  }

  async function changeStatus(ticketId: string, newStatus: TicketStatus, byNimNip: string) {
    await fetch(`${API_URL}/tickets/${encodeURIComponent(ticketId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, byNimNip })
    });
    await fetchTickets();
  }

  async function assignTicket(ticketId: string, assigneeName: string, byNimNip: string, notes?: string) {
    await fetch(`${API_URL}/tickets/${encodeURIComponent(ticketId)}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigneeName, byNimNip, notes })
    });
    await fetchTickets();
  }

  async function markAsIncident(ticketId: string, incidentNotes: string, byNimNip: string) {
    await fetch(`${API_URL}/tickets/${encodeURIComponent(ticketId)}/incident`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentNotes, byNimNip })
    });
    await fetchTickets();
  }

  let ws: WebSocket | null = null;
  let reconnectTimeout: any = null;
  const isWsConnected = ref(false);

  function connectWebSocket() {
    if (ws) return;

    try {
      console.log(`[WS] Connecting to WebSocket at ${WS_URL}...`);
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[WS] Connected to WebSocket server.');
        isWsConnected.value = true;
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WS] Event received:', data);
          if (data.event === 'tickets_updated' || data.event === 'users_updated') {
            // Silently fetch tickets to sync real-time changes
            fetchTickets(true);
          }
        } catch (e) {
          console.error('[WS] Error parsing WebSocket message:', e);
        }
      };

      ws.onclose = (event) => {
        console.warn(`[WS] Connection closed (code: ${event.code}). Reconnecting in 5 seconds...`);
        isWsConnected.value = false;
        ws = null;
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            connectWebSocket();
          }, 5000);
        }
      };

      ws.onerror = (err) => {
        console.error('[WS] WebSocket error:', err);
      };
    } catch (err) {
      console.error('[WS] Failed to connect:', err);
      isWsConnected.value = false;
      if (!reconnectTimeout) {
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null;
          connectWebSocket();
        }, 5000);
      }
    }
  }

  // Initial fetch and WebSocket connect
  fetchTickets();
  connectWebSocket();

  return {
    tickets,
    isLoading,
    isWsConnected,
    allTickets,
    urgentTickets,
    adminStats,
    fetchTickets,
    connectWebSocket,
    startPolling,
    stopPolling,
    getTicketsByUser,
    getRecentTicketsByUser,
    getUserStats,
    submitTicket,
    addComment,
    changeStatus,
    assignTicket,
    markAsIncident,
  }
})
