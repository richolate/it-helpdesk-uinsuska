<script setup lang="ts">
import { computed } from "vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, Activity, InboxIcon } from "lucide-vue-next";
import TicketStatusBadge from "../shared/TicketStatusBadge.vue";
import PriorityBadge from "../shared/PriorityBadge.vue";
import SLATimer from "../shared/SLATimer.vue";
import { Chart as ChartJS, Title, Tooltip as ChartTooltip, Legend as ChartLegend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';
import { useTicketStore } from "@/stores/useTicketStore";
import DashboardSkeleton from "../shared/DashboardSkeleton.vue";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend, ArcElement);

const ticketStore = useTicketStore();

// ─── Stats cards ──────────────────────────────────────────────────────────────
const statCards = computed(() => {
  const s = ticketStore.adminStats;
  return [
    { label: 'Tiket Aktif', value: s.active, change: '', icon: Ticket, color: 'text-green-700', bgColor: 'bg-green-50' },
    { label: 'Selesai (Hari Ini)', value: s.resolvedToday, change: '', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'SLA Warning', value: s.slaWarning, change: '', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { label: 'SLA Breach', value: s.slaBreach, change: '', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
  ];
});

// ─── Bar chart: ticket activity last 7 days ───────────────────────────────────
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const barChartData = computed(() => {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  const labels = days.map(d => DAY_NAMES[d.getDay()]);
  const created = days.map(d => {
    const end = new Date(d.getTime() + 86400000);
    return ticketStore.tickets.filter(t => {
      const ct = new Date(t.createdAt);
      return ct >= d && ct < end;
    }).length;
  });
  const resolved = days.map(d => {
    const end = new Date(d.getTime() + 86400000);
    return ticketStore.tickets.filter(t => {
      if (t.status !== 'Resolved') return false;
      const ut = new Date(t.updatedAt);
      return ut >= d && ut < end;
    }).length;
  });
  const pending = days.map(d => {
    const end = new Date(d.getTime() + 86400000);
    return ticketStore.tickets.filter(t => {
      if (t.status !== 'Pending') return false;
      const ut = new Date(t.updatedAt);
      return ut >= d && ut < end;
    }).length;
  });
  return {
    labels,
    datasets: [
      { label: 'Dibuat', backgroundColor: '#2E7D32', borderRadius: 4, data: created },
      { label: 'Selesai', backgroundColor: '#10b981', borderRadius: 4, data: resolved },
      { label: 'Pending', backgroundColor: '#f59e0b', borderRadius: 4, data: pending },
    ],
  };
});

const barChartOptions = { 
  responsive: true, 
  maintainAspectRatio: false,
  animation: {
    duration: 1500,
    easing: 'easeOutQuart'
  },
  plugins: { legend: { position: 'bottom' } },
  scales: { 
    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } }, 
    x: { grid: { display: false }, border: { display: false } } 
  }
};

// ─── Pie chart: by category ───────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Jaringan: '#2E7D32', Akun: '#10b981', Perangkat: '#8b5cf6',
  iRaise: '#F9A825', Software: '#3b82f6', Infrastruktur: '#ef4444', Lainnya: '#6b7280',
};

const pieChartData = computed(() => {
  const counts: Record<string, number> = {};
  for (const t of ticketStore.tickets) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }
  const entries = Object.entries(counts).filter(([, v]) => v > 0);
  if (entries.length === 0) {
    return { labels: ['Belum ada data'], datasets: [{ backgroundColor: ['#e2e8f0'], data: [1] }] };
  }
  return {
    labels: entries.map(([k]) => k),
    datasets: [{ 
      backgroundColor: entries.map(([k]) => CATEGORY_COLORS[k] || '#6b7280'), 
      data: entries.map(([, v]) => v),
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };
});

const pieChartOptions = { 
  responsive: true, 
  maintainAspectRatio: false,
  cutout: '75%',
  animation: {
    duration: 1500,
    easing: 'easeOutQuart',
    animateRotate: true,
    animateScale: false
  },
  plugins: { 
    legend: { position: 'right' } 
  }
};

// ─── Urgent tickets ───────────────────────────────────────────────────────────
const urgentTickets = computed(() =>
  ticketStore.tickets
    .filter(t => t.priority === 'High' && t.status !== 'Resolved' && t.status !== 'Closed')
    .slice(0, 5)
);

// ─── Team performance: computed from store ────────────────────────────────────
const performanceData = computed(() => {
  const staffMap: Record<string, { resolved: number; totalMs: number }> = {};
  for (const t of ticketStore.tickets) {
    if (t.assignedTo && t.status === 'Resolved') {
      if (!staffMap[t.assignedTo]) staffMap[t.assignedTo] = { resolved: 0, totalMs: 0 };
      staffMap[t.assignedTo].resolved++;
      staffMap[t.assignedTo].totalMs += new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
    }
  }
  return Object.entries(staffMap)
    .map(([name, d]) => ({
      name,
      resolved: d.resolved,
      avgTime: d.resolved > 0 ? `${(d.totalMs / d.resolved / 3600000).toFixed(1)}j` : '-',
    }))
    .sort((a, b) => b.resolved - a.resolved);
});
</script>

<template>
<div class="space-y-6">
  <div v-if="ticketStore.isLoading">
    <DashboardSkeleton />
  </div>

  <div v-else class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
      <p class="text-slate-600 mt-1">Real-time monitoring dan statistik IT Helpdesk</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card v-for="stat in statCards" :key="stat.label">
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

  <!-- Charts -->
  <div class="grid lg:grid-cols-3 gap-6">
    <Card class="lg:col-span-2">
      <CardHeader>
        <CardTitle>Ticket Trends (7 Hari Terakhir)</CardTitle>
        <CardDescription>Aktivitas tiket harian</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="w-full h-[280px]">
          <Bar :key="ticketStore.tickets.length" :data="barChartData" :options="barChartOptions" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Distribusi Kategori</CardTitle>
        <CardDescription>Breakdown by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="w-full h-[280px]">
          <Doughnut :key="ticketStore.tickets.length" :data="pieChartData" :options="pieChartOptions" />
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Urgent Tickets -->
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-red-600" />
            Tiket Urgent &amp; SLA Monitoring
          </CardTitle>
          <CardDescription>Tiket High priority yang belum selesai</CardDescription>
        </div>
        <Badge variant="outline" class="bg-red-50 text-red-700 border-red-200">
          {{ urgentTickets.length }} Urgent
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="urgentTickets.length === 0" class="text-center py-8">
        <CheckCircle2 class="w-10 h-10 text-green-300 mx-auto mb-3" />
        <p class="text-slate-500">Tidak ada tiket urgent saat ini</p>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="ticket in urgentTickets"
          :key="ticket.id"
          class="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg hover:border-green-300 transition-colors"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-sm font-medium text-slate-500">{{ ticket.id }}</span>
              <PriorityBadge :priority="ticket.priority" showIcon />
              <TicketStatusBadge :status="ticket.status" />
              <Badge variant="outline" class="bg-slate-50">{{ ticket.category }}</Badge>
            </div>
            <h4 class="font-medium text-slate-900 mb-1 truncate">{{ ticket.title }}</h4>
            <div class="flex items-center gap-1 text-sm text-slate-600">
              <Users class="w-4 h-4" />
              <span>{{ ticket.assignedTo || 'Belum di-assign' }}</span>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="text-xs text-slate-500 mb-1">SLA Time:</p>
            <SLATimer :dueDate="new Date(ticket.slaDeadline)" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Team Performance -->
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Activity class="w-5 h-5 text-green-600" />
        Team Performance
      </CardTitle>
      <CardDescription>Statistik kinerja tim berdasarkan tiket yang diselesaikan</CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="performanceData.length === 0" class="text-center py-8">
        <InboxIcon class="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p class="text-slate-500">Belum ada tiket yang diselesaikan</p>
        <p class="text-sm text-slate-400 mt-1">Data akan muncul setelah admin menyelesaikan tiket</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="(member, index) in performanceData" :key="index" class="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
          <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Users class="w-6 h-6 text-indigo-600" />
          </div>
          <div class="flex-1 grid grid-cols-3 gap-4">
            <div>
              <p class="text-sm font-medium text-slate-900">{{ member.name }}</p>
              <p class="text-xs text-slate-500">IT Support</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-green-600">{{ member.resolved }}</p>
              <p class="text-xs text-slate-500">Tiket Selesai</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-semibold text-slate-900">{{ member.avgTime }}</p>
              <p class="text-xs text-slate-500">Rata-rata Waktu</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  </div>
</div>
</template>
