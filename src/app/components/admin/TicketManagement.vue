<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TicketStatusBadge from "../shared/TicketStatusBadge.vue";
import PriorityBadge from "../shared/PriorityBadge.vue";
import SLATimer from "../shared/SLATimer.vue";
import TicketListSkeleton from "../shared/TicketListSkeleton.vue";
import { Search, Filter, UserPlus, ArrowUpCircle, Eye, MessageSquare, History, AlertCircle, AlertTriangle, FileWarning, BookmarkPlus, InboxIcon, Send, CheckCircle2, User } from "lucide-vue-next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/composables/useAuth";
import { useTicketStore, formatDate, type TicketStatus } from "@/stores/useTicketStore";
import { useRouter } from "vue-router";

const auth = useAuth();
const ticketStore = useTicketStore();
const router = useRouter();
const currentUser = computed(() => auth.getCurrentUser());

// ─── Dynamic team members ──────────────────────────────────────────────────────
const teamMembers = ref<any[]>([]);

const fetchTeamMembers = async () => {
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/users');
    const data = await res.json();
    // Filter out users who are not Admin IT or Teknisi, although the API already does it.
    teamMembers.value = data;
  } catch (err) {
    console.error('Failed to fetch team members', err);
  }
};

onMounted(() => {
  fetchTeamMembers();
});

// Workload count per technician
const workload = computed(() => {
  const map: Record<string, number> = {};
  for (const t of ticketStore.tickets) {
    if (t.assignedTo && t.status !== 'Resolved' && t.status !== 'Closed') {
      map[t.assignedTo] = (map[t.assignedTo] || 0) + 1;
    }
  }
  return map;
});

// ─── Filters ─────────────────────────────────────────────────────────────────
const searchQuery = ref('');
const filterStatus = ref('all-status');
const filterPriority = ref('all-priority');
const filterAssigned = ref('all-assigned');

const filteredTickets = computed(() => {
  let list = [...ticketStore.tickets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.requesterNama.toLowerCase().includes(q));
  }
  if (filterStatus.value !== 'all-status') {
    list = list.filter(t => t.status.toLowerCase().replace(' ', '-') === filterStatus.value);
  }
  if (filterPriority.value !== 'all-priority') {
    list = list.filter(t => t.priority.toLowerCase() === filterPriority.value);
  }
  if (filterAssigned.value === 'unassigned') {
    list = list.filter(t => !t.assignedTo);
  } else if (filterAssigned.value !== 'all-assigned') {
    list = list.filter(t => t.assignedTo === filterAssigned.value);
  }
  return list;
});

// ─── Detail navigation ───────────────────────────────────────────────────────
function openDetail(ticketId: string) {
  router.push('/admin/tickets/' + encodeURIComponent(ticketId));
}
</script>

<template>
<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Ticket Management</h2>
      <p class="text-slate-600 mt-1">Kelola, assign, dan monitor semua tiket support</p>
    </div>
    <div class="flex gap-2">
      <Button variant="outline">
        <Filter class="w-4 h-4 mr-2" />Filter
      </Button>
      <Button variant="outline">Export</Button>
    </div>
  </div>

  <!-- Filters -->
  <Card>
    <CardContent class="pt-6">
      <div class="grid md:grid-cols-5 gap-4">
        <div class="md:col-span-2 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input v-model="searchQuery" placeholder="Cari tiket, judul, atau requester..." class="pl-10" />
        </div>
        <Select v-model="filterStatus">
          <SelectTrigger><SelectValue placeholder="Semua Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-status">Semua Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="filterPriority">
          <SelectTrigger><SelectValue placeholder="Semua Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-priority">Semua Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="filterAssigned">
          <SelectTrigger><SelectValue placeholder="Semua Assigned" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-assigned">Semua Assigned</SelectItem>
            <SelectItem v-for="m in teamMembers" :key="m.id" :value="m.name">{{ m.name }}</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>

  <!-- Tickets Table -->
  <Card>
    <CardHeader>
      <CardTitle>Active Tickets</CardTitle>
      <CardDescription>Total {{ filteredTickets.length }} tiket</CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Empty -->
      <div v-if="ticketStore.isLoading">
        <TicketListSkeleton :rows="5" />
      </div>
      <div v-else-if="ticketStore.tickets.length === 0" class="text-center py-16">
        <InboxIcon class="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <p class="text-slate-500 font-medium">Belum ada tiket masuk</p>
        <p class="text-sm text-slate-400 mt-1">Tiket yang dibuat user akan muncul di sini</p>
      </div>

      <div v-else class="border rounded-lg max-h-[600px] overflow-y-auto relative">
        <Table>
          <TableHeader class="sticky top-0 z-10 bg-slate-50 shadow-sm">
            <TableRow>
              <TableHead class="font-semibold">ID</TableHead>
              <TableHead class="font-semibold">Judul</TableHead>
              <TableHead class="font-semibold">Waktu Masuk</TableHead>
              <TableHead class="font-semibold">Requester</TableHead>
              <TableHead class="font-semibold">Priority</TableHead>
              <TableHead class="font-semibold">Status</TableHead>
              <TableHead class="font-semibold">Assigned To</TableHead>
              <TableHead class="font-semibold">SLA Time</TableHead>
              <TableHead class="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="ticket in filteredTickets" :key="ticket.id" class="hover:bg-slate-50">
              <TableCell class="font-medium">{{ ticket.id }}</TableCell>
              <TableCell class="max-w-xs">
                <div class="truncate font-medium">{{ ticket.title }}</div>
                <div class="text-xs text-slate-500">{{ ticket.category }}</div>
              </TableCell>
              <TableCell class="text-sm whitespace-nowrap text-slate-600">{{ formatDate(ticket.createdAt) }}</TableCell>
              <TableCell class="text-sm">{{ ticket.requesterNama }}</TableCell>
              <TableCell><PriorityBadge :priority="ticket.priority" showIcon /></TableCell>
              <TableCell><TicketStatusBadge :status="ticket.status" /></TableCell>
              <TableCell class="text-sm">
                <span v-if="ticket.assignedTo">{{ ticket.assignedTo }}</span>
                <span v-else class="text-slate-400 italic">Unassigned</span>
              </TableCell>
              <TableCell>
                <SLATimer :dueDate="new Date(ticket.slaDeadline)" :status="ticket.status" />
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="sm" @click="openDetail(ticket.id)">
                  <Eye class="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</div>
</template>
