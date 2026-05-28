<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Info,
  InboxIcon,
} from "lucide-vue-next";
import TicketStatusBadge from "../shared/TicketStatusBadge.vue";
import { useAuth } from "@/composables/useAuth";
import { useTicketStore, formatDateShort } from "@/stores/useTicketStore";
import DashboardSkeleton from "../shared/DashboardSkeleton.vue";

const auth = useAuth();
const ticketStore = useTicketStore();
const currentUser = computed(() => auth.getCurrentUser());

// ─── Statistik dihitung dari store ───────────────────────────────────────────
const stats = computed(() => {
  const nimNip = currentUser.value?.nimNip ?? '';
  const s = ticketStore.getUserStats(nimNip);
  return [
    {
      label: 'Tiket Aktif',
      value: s.active,
      icon: Clock,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Dalam Proses',
      value: s.inProgress,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Selesai (30 hari)',
      value: s.resolvedLast30,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Tiket',
      value: s.total,
      icon: FileText,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
  ];
});

// ─── Tiket terbaru (3 paling baru) ───────────────────────────────────────────
const recentTickets = computed(() => {
  const nimNip = currentUser.value?.nimNip ?? '';
  return ticketStore.getRecentTicketsByUser(nimNip, 3);
});

// ─── Notifikasi: dibangun dari event tiket (komentar & status) ────────────────
const notifications = computed(() => {
  const nimNip = currentUser.value?.nimNip ?? '';
  const userTickets = ticketStore.getTicketsByUser(nimNip);
  const items: { id: string; type: string; title: string; message: string; time: string }[] = [];

  for (const ticket of userTickets) {
    // Status resolved → notif sukses
    if (ticket.status === 'Resolved') {
      items.push({
        id: `${ticket.id}-resolved`,
        type: 'success',
        title: `Tiket ${ticket.id} telah diselesaikan`,
        message: ticket.title,
        time: ticket.updatedAt,
      });
    }
    // Status pending → notif warning (butuh info)
    if (ticket.status === 'Pending') {
      items.push({
        id: `${ticket.id}-pending`,
        type: 'warning',
        title: `Diperlukan informasi tambahan`,
        message: `Mohon balas pesan di tiket ${ticket.id}: ${ticket.title}`,
        time: ticket.updatedAt,
      });
    }
    // Komentar dari Tim IT → notif info
    const itReplies = ticket.comments.filter((c) => c.role === 'Admin IT');
    if (itReplies.length > 0) {
      const last = itReplies[itReplies.length - 1];
      items.push({
        id: `${ticket.id}-comment-${itReplies.length}`,
        type: 'info',
        title: `Tim IT membalas di tiket ${ticket.id}`,
        message: last.message.length > 60 ? last.message.slice(0, 60) + '...' : last.message,
        time: last.time,
      });
    }
  }

  // Urutkan dari terbaru, ambil 5 teratas
  return items
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);
});

const notifClass = (type: string) =>
  type === 'success'
    ? 'border-green-200 bg-green-50'
    : type === 'warning'
    ? 'border-yellow-200 bg-yellow-50'
    : 'border-blue-200 bg-blue-50';

// ─── Helper relatif waktu ─────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari yang lalu`;
}
</script>

<template>
<div class="space-y-8">
  <div v-if="ticketStore.isLoading">
    <DashboardSkeleton />
  </div>

  <div v-else class="space-y-8">
    <!-- Welcome Section -->
    <div>
      <h2 class="text-2xl font-bold text-slate-900">
        Selamat Datang, {{ currentUser?.nama ?? '...' }}
      </h2>
      <p class="text-slate-600 mt-1">Berikut adalah ringkasan aktivitas helpdesk Anda</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card v-for="stat in stats" :key="stat.label">
      <CardContent class="pt-6">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-slate-600 mb-1">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-slate-900">{{ stat.value }}</p>
          </div>
          <div :class="[stat.bgColor, 'p-3 rounded-lg']">
            <component :is="stat.icon" :class="['w-6 h-6', stat.color]" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Quick Actions -->
  <Card>
    <CardHeader>
      <CardTitle>Aksi Cepat</CardTitle>
      <CardDescription>Buat tiket baru atau akses layanan</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-wrap gap-3">
        <router-link to="/user/submit-ticket">
          <Button class="bg-green-700 hover:bg-green-800">
            <Plus class="w-4 h-4 mr-2" />
            Buat Tiket Baru
          </Button>
        </router-link>
        <router-link to="/user/my-tickets">
          <Button variant="outline">
            <FileText class="w-4 h-4 mr-2" />
            Lihat Semua Tiket
          </Button>
        </router-link>
        <router-link to="/user/knowledge-base">
          <Button variant="outline">
            <Info class="w-4 h-4 mr-2" />
            Cari Solusi di FAQ
          </Button>
        </router-link>
      </div>
    </CardContent>
  </Card>

  <div class="grid lg:grid-cols-2 gap-8">
    <!-- Notifications -->
    <Card>
      <CardHeader>
        <CardTitle>Notifikasi Terbaru</CardTitle>
        <CardDescription>Update tentang tiket Anda</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Empty notif state -->
        <div v-if="notifications.length === 0" class="text-center py-8">
          <AlertCircle class="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p class="text-sm text-slate-400">Belum ada notifikasi</p>
          <p class="text-xs text-slate-400 mt-1">Notifikasi akan muncul saat status tiket berubah</p>
        </div>

        <Alert
          v-for="notif in notifications"
          :key="notif.id"
          :class="notifClass(notif.type)"
        >
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>
            <p class="font-medium text-slate-900">{{ notif.title }}</p>
            <p class="text-sm text-slate-600 mt-1">{{ notif.message }}</p>
            <p class="text-xs text-slate-500 mt-2">{{ relativeTime(notif.time) }}</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>

    <!-- Recent Tickets -->
    <Card>
      <CardHeader>
        <CardTitle>Tiket Terbaru</CardTitle>
        <CardDescription>Status tiket yang sedang berjalan</CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Empty state -->
        <div v-if="recentTickets.length === 0" class="text-center py-8">
          <InboxIcon class="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p class="text-sm text-slate-400">Belum ada tiket</p>
          <router-link to="/user/submit-ticket">
            <Button class="bg-green-700 hover:bg-green-800 mt-4" size="sm">
              <Plus class="w-4 h-4 mr-2" />
              Buat Tiket Pertama
            </Button>
          </router-link>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="ticket in recentTickets"
            :key="ticket.id"
            class="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm font-medium text-slate-500">{{ ticket.id }}</span>
                <TicketStatusBadge :status="ticket.status" />
              </div>
              <h4 class="font-medium text-slate-900 mb-1 truncate">{{ ticket.title }}</h4>
              <div class="flex items-center gap-3 text-sm text-slate-500">
                <span>{{ ticket.category }}</span>
                <span>•</span>
                <span>{{ formatDateShort(ticket.createdAt) }}</span>
              </div>
            </div>
          </div>

          <router-link to="/user/my-tickets">
            <Button variant="outline" class="w-full mt-2">
              Lihat Semua Tiket
            </Button>
          </router-link>
        </div>
      </CardContent>
    </Card>
    </div>
  </div>
</div>
</template>
