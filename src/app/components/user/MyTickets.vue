<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import TicketStatusBadge from "../shared/TicketStatusBadge.vue";
import PriorityBadge from "../shared/PriorityBadge.vue";
import SLATimer from "../shared/SLATimer.vue";
import TicketListSkeleton from "../shared/TicketListSkeleton.vue";
import { Search, Eye, MessageSquare, Calendar, Tag, InboxIcon, Send } from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";
import { useTicketStore, formatDate, formatDateShort } from "@/stores/useTicketStore";

const auth = useAuth();
const router = useRouter();
const ticketStore = useTicketStore();
const currentUser = computed(() => auth.getCurrentUser());

// ─── Tickets dari store (hanya milik user yang login) ─────────────────────────
const myTickets = computed(() =>
  currentUser.value
    ? ticketStore.getTicketsByUser(currentUser.value.nimNip)
    : []
);

// ─── Filters ──────────────────────────────────────────────────────────────────
const searchQuery = ref('');
const filterStatus = ref('all');
const filterCategory = ref('all');

const filteredTickets = computed(() => {
  let list = myTickets.value;

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  }

  if (filterStatus.value !== 'all') {
    list = list.filter((t) => t.status.toLowerCase().replace(' ', '-') === filterStatus.value);
  }

  if (filterCategory.value !== 'all') {
    list = list.filter((t) => t.category === filterCategory.value);
  }

  return list;
});



// ─── Priority badge helper ─────────────────────────────────────────────────────
const priorityClass = (priority: string) => {
  if (priority === 'High') return 'bg-red-50 text-red-700 border-red-200';
  if (priority === 'Medium') return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

// ─── Is comment from IT support ───────────────────────────────────────────────
const isItSupport = (role: string) => role === 'Admin IT';
</script>

<template>
<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold text-slate-900">Tiket Saya</h2>
    <p class="text-slate-600 mt-1">Lihat dan lacak status semua tiket dukungan Anda</p>
  </div>

  <!-- Filters -->
  <Card>
    <CardContent class="pt-6">
      <div class="grid md:grid-cols-4 gap-4">
        <div class="md:col-span-2">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              v-model="searchQuery"
              placeholder="Cari tiket berdasarkan judul atau ID..."
              class="pl-10"
            />
          </div>
        </div>

        <Select v-model="filterStatus">
          <SelectTrigger>
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="filterCategory">
          <SelectTrigger>
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="Jaringan">Jaringan</SelectItem>
            <SelectItem value="iRaise">iRaise</SelectItem>
            <SelectItem value="Akun">Akun</SelectItem>
            <SelectItem value="Perangkat">Perangkat</SelectItem>
            <SelectItem value="Software">Software</SelectItem>
            <SelectItem value="Lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>

  <!-- Tickets Table -->
  <Card>
    <CardHeader>
      <CardTitle>Riwayat Tiket</CardTitle>
      <CardDescription>
        Total {{ filteredTickets.length }} tiket
        <span v-if="filteredTickets.length !== myTickets.length" class="text-slate-400">
          (dari {{ myTickets.length }} total)
        </span>
      </CardDescription>
    </CardHeader>
    <CardContent>

      <!-- Loading skeleton -->
      <div v-if="ticketStore.isLoading">
        <TicketListSkeleton :rows="5" />
      </div>
      <div v-else-if="myTickets.length === 0" class="text-center py-16">
        <InboxIcon class="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <p class="text-slate-500 font-medium">Belum ada tiket</p>
        <p class="text-sm text-slate-400 mt-1">Tiket yang Anda buat akan muncul di sini</p>
        <router-link to="/user/submit-ticket" class="mt-4 inline-block">
          <Button class="bg-green-700 hover:bg-green-800 mt-4">Buat Tiket Pertama</Button>
        </router-link>
      </div>

      <!-- No search results -->
      <div v-else-if="filteredTickets.length === 0" class="text-center py-12">
        <Search class="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p class="text-slate-500">Tidak ada tiket yang cocok dengan filter</p>
        <Button variant="outline" class="mt-3" @click="searchQuery = ''; filterStatus = 'all'; filterCategory = 'all'">
          Reset Filter
        </Button>
      </div>

      <!-- Table -->
      <div v-else class="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="bg-slate-50">
              <TableHead class="font-semibold">ID Tiket</TableHead>
              <TableHead class="font-semibold">Judul</TableHead>
              <TableHead class="font-semibold">Kategori</TableHead>
              <TableHead class="font-semibold">Status</TableHead>
              <TableHead class="font-semibold">Prioritas</TableHead>
              <TableHead class="font-semibold">Tanggal</TableHead>
              <TableHead class="font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="ticket in filteredTickets" :key="ticket.id" class="hover:bg-slate-50">
              <TableCell class="font-medium text-slate-700">{{ ticket.id }}</TableCell>
              <TableCell class="max-w-xs">
                <div class="truncate">{{ ticket.title }}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" class="bg-slate-50">{{ ticket.category }}</Badge>
              </TableCell>
              <TableCell>
                <TicketStatusBadge :status="ticket.status" />
              </TableCell>
              <TableCell>
                <Badge variant="outline" :class="priorityClass(ticket.priority)">
                  {{ ticket.priority }}
                </Badge>
              </TableCell>
              <TableCell class="text-sm text-slate-600">
                {{ formatDateShort(ticket.createdAt) }}
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="sm" @click="router.push(`/user/tickets/${encodeURIComponent(ticket.id)}`)">
                  <Eye class="w-4 h-4 mr-2" />
                  Detail
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
