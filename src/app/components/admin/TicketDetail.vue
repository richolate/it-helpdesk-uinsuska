<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTicketStore } from '@/stores/useTicketStore';
import { useAuth } from '@/composables/useAuth';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import TicketStatusBadge from "@/app/components/shared/TicketStatusBadge.vue";
import PriorityBadge from "@/app/components/shared/PriorityBadge.vue";
import SLATimer from "@/app/components/shared/SLATimer.vue";
import TicketDetailSkeleton from "@/app/components/shared/TicketDetailSkeleton.vue";
import { 
  ArrowLeft, Upload, Send, MessageSquare, History, CheckCircle2, User, UserPlus, 
  ArrowUpCircle, AlertCircle, FileWarning, Paperclip, BookmarkPlus, AlertTriangle,
  Plus, ShieldAlert, Eye
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const ticketStore = useTicketStore();
const auth = useAuth();

const currentUser = computed(() => auth.getCurrentUser());
const ticketId = computed(() => route.params.id as string);
const ticket = computed(() => ticketStore.tickets.find(t => t.id === ticketId.value));

const selectedStatus = ref(ticket.value?.status || '');
const replyText = ref('');
const incidentDialogOpen = ref(false);

const showAssignForm = ref(false);
const assignee = ref('');
const assignNotes = ref('');

// Incident Data
const incidentSeverity = ref('');
const incidentDescription = ref('');
const rootCause = ref('');
const resolution = ref('');
const preventiveAction = ref('');
const downtime = ref('');
const affectedUsers = ref('');

const escalateDialogOpen = ref(false);
const imageDialogOpen = ref(false);
const selectedImage = ref('');

// Team Members for assignment
const teamMembers = ref<any[]>([]);

const fetchTeamMembers = async () => {
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/users');
    const data = await res.json();
    teamMembers.value = data.filter((u: any) => u.role === 'Admin IT' || u.role === 'Teknisi');
  } catch (err) {
    console.error('Failed to fetch team members', err);
  }
};

const workload = computed(() => {
  const map: Record<string, number> = {};
  for (const t of ticketStore.tickets) {
    if (t.assignedTo && t.status !== 'Resolved' && t.status !== 'Closed') {
      map[t.assignedTo] = (map[t.assignedTo] || 0) + 1;
    }
  }
  return map;
});

onMounted(() => {
  if (!ticket.value) {
    router.push('/admin/tickets');
  } else {
    fetchTeamMembers();
  }
});

const goBack = () => {
  router.push('/admin/tickets');
};

const doChangeStatus = async () => {
  if (!ticket.value || !currentUser.value) return;
  await ticketStore.changeStatus(ticket.value.id, selectedStatus.value as any, currentUser.value.nimNip);
};

const doAssign = async () => {
  if (!ticket.value || !currentUser.value) return;
  await ticketStore.assignTicket(ticket.value.id, assignee.value, currentUser.value.nimNip, assignNotes.value);
  showAssignForm.value = false;
};

const confirmEscalate = async () => {
  if (!ticket.value || !currentUser.value) return;
  await ticketStore.changeStatus(ticket.value.id, 'In Progress', currentUser.value.nimNip);
  escalateDialogOpen.value = false;
};

const doReply = async () => {
  if (!replyText.value.trim() || !ticket.value || !currentUser.value) return;
  
  await ticketStore.addComment(ticket.value.id, {
    message: replyText.value
  }, currentUser.value.nimNip);
  
  replyText.value = '';
};

const doMarkIncident = async () => {
  if (!ticket.value || !currentUser.value) return;
  const notes = [
    `[${incidentSeverity.value.toUpperCase()}] ${incidentDescription.value}`,
    `Root Cause: ${rootCause.value}`,
    `Solusi: ${resolution.value}`,
    preventiveAction.value ? `Preventif: ${preventiveAction.value}` : '',
    `Downtime: ${downtime.value || '-'} | Users Terdampak: ${affectedUsers.value || '-'}`,
  ].filter(Boolean).join('\n');
  
  await ticketStore.markAsIncident(ticket.value.id, notes, currentUser.value.nimNip);
  incidentDialogOpen.value = false;
};

const assigneeSpecialty = computed(() => {
  if (!ticket.value || !ticket.value.assignedTo) return '';
  const tech = teamMembers.value.find((m: any) => m.name === ticket.value!.assignedTo);
  return tech?.specialty || 'General IT';
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleString('id-ID', { 
    day: 'numeric', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  });
};

const formatDateShort = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' ' +
         d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};
</script>

<template>
  <div v-if="ticket" class="max-w-7xl mx-auto space-y-4">
    <!-- Breadcrumb & Back Button -->
    <div class="flex items-center text-sm text-slate-500 mb-2">
      <Button variant="ghost" class="pl-0 text-slate-500 hover:text-slate-900" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-2" /> Kembali
      </Button>
    </div>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-slate-900">{{ ticket.title }}</h1>
          <PriorityBadge :priority="ticket.priority" />
          <Badge v-if="ticket.isIncident" class="bg-red-100 text-red-700 border-red-200"><ShieldAlert class="w-3 h-3 mr-1"/> Incident</Badge>
        </div>
        <p class="text-sm text-slate-500 font-medium">Masuk pada: {{ formatDate(ticket.createdAt) }}</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left Column: Details & Tabs -->
      <div class="lg:col-span-2 border border-slate-200 rounded-xl bg-white overflow-hidden flex flex-col min-h-[500px]">
        <Tabs default-value="details" class="flex flex-col h-full">
          <TabsList class="grid grid-cols-3 rounded-none border-b bg-slate-50 p-0 h-14 justify-start w-full">
            <TabsTrigger value="details" class="rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-700">Details</TabsTrigger>
            <TabsTrigger value="communication" class="rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-700">
              Communication <Badge class="ml-2 bg-slate-200 text-slate-700 hover:bg-slate-300">{{ ticket.comments.length }}</Badge>
            </TabsTrigger>
            <TabsTrigger value="audit" class="rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-700">
              Audit Log <Badge class="ml-2 bg-green-100 text-green-700 hover:bg-green-200">{{ ticket.auditLog.length }}</Badge>
            </TabsTrigger>
          </TabsList>

          <!-- DETAILS TAB -->
          <TabsContent value="details" class="flex-1 p-6 m-0 outline-none space-y-6 overflow-y-auto">
            
            <div v-if="showAssignForm" class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-bold text-slate-900 text-lg">Pilih Teknisi</h3>
                  <p class="text-xs text-slate-500">Pilih teknisi dari daftar berikut</p>
                </div>
              </div>
              
              <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                <div 
                  v-for="m in teamMembers" :key="m.id"
                  @click="assignee = m.name"
                  :class="[
                    'border rounded-xl p-4 flex items-center justify-between transition-colors cursor-pointer hover:border-green-300 bg-white',
                    assignee === m.name ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200'
                  ]"
                >
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-500">
                      <User class="w-6 h-6" />
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900 text-base">{{ m.name }}</p>
                      <p class="text-sm text-slate-500">{{ m.specialty || 'General IT' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1.5">
                      <div class="w-2 h-2 rounded-full bg-green-500"></div>
                      <span class="text-sm font-medium text-green-700">{{ workload[m.name] || 0 }} aktif</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-2 pt-4">
                <Label class="text-sm font-semibold text-slate-900">Catatan untuk teknisi (opsional)</Label>
                <Textarea v-model="assignNotes" placeholder="Tambahkan instruksi khusus di sini..." :rows="3" class="bg-white resize-none text-sm" />
              </div>

              <div class="flex gap-4 pt-2">
                <Button variant="outline" class="flex-1 border-slate-300 text-slate-700 h-12" @click="showAssignForm = false; assignee = '';">Batal</Button>
                <Button class="flex-1 bg-green-900 hover:bg-green-950 text-white h-12 text-base" :disabled="!assignee" @click="doAssign">Assign Ticket</Button>
              </div>
            </div>

            <div v-else class="space-y-6">
              <!-- Grid Details -->
              <div class="grid grid-cols-3 gap-6 p-5 border border-slate-100 rounded-xl">
                <div>
                  <p class="text-xs text-slate-500 mb-1">Requester</p>
                  <p class="font-medium text-sm text-slate-900">{{ ticket.requesterNama }} ({{ ticket.requesterNimNip }})</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 mb-1">Category</p>
                  <p class="font-medium text-sm text-slate-900">{{ ticket.category }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 mb-1">Location</p>
                  <p class="font-medium text-sm text-slate-900">{{ ticket.location }}</p>
                </div>
                <div class="col-span-1">
                  <p class="text-xs text-slate-500 mb-1">SLA Deadline</p>
                  <SLATimer :dueDate="new Date(ticket.slaDeadline)" :status="ticket.status" class="text-red-600 font-medium" />
                </div>
                <div class="col-span-2">
                  <p class="text-xs text-slate-500 mb-1">Assigned To</p>
                  <p class="font-medium text-sm text-slate-900 italic" v-if="!ticket.assignedTo">Unassigned</p>
                  <p class="font-medium text-sm text-slate-900" v-else>{{ ticket.assignedTo }}</p>
                </div>
              </div>

              <!-- Description -->
              <div>
                <Label class="text-sm font-bold text-slate-900">Description</Label>
                <div class="mt-2 p-4 bg-slate-50/80 rounded-xl text-sm text-slate-700 border border-slate-100 whitespace-pre-line leading-relaxed">
                  {{ ticket.description }}
                </div>
              </div>

              <!-- Admin note -->
              <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-bold text-amber-900 text-sm">Catatan untuk Admin</p>
                  <p class="text-sm text-amber-800 mt-1">Teknisi tidak memiliki akses ke sistem. Admin bertanggung jawab mengupdate semua progress melalui sistem ini.</p>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-wrap gap-3 items-center mt-6 pt-4 border-t border-slate-100">
                <Button variant="outline" class="border-green-700 text-green-700 flex-1 sm:flex-none h-10 px-6 rounded-lg font-semibold" @click="showAssignForm = true">
                  Assign
                </Button>
                <Button variant="outline" class="border-slate-300 text-slate-700 flex-1 sm:flex-none h-10 px-6 rounded-lg font-semibold" @click="escalateDialogOpen = true">
                  Escalate
                </Button>

                <div class="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Select v-model="selectedStatus">
                    <SelectTrigger class="h-10 bg-white flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button @click="doChangeStatus" class="bg-blue-900 hover:bg-blue-950 text-white h-10 px-6 rounded-lg font-semibold">
                    <CheckCircle2 class="w-4 h-4 mr-2" /> Confirm
                  </Button>
                </div>
              </div>

              <!-- Incident -->
              <div class="pt-6">
                <div v-if="ticket.isIncident" class="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <FileWarning class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <p class="font-bold text-red-900 text-sm">Incident Details</p>
                      <Badge class="bg-red-600 text-white text-xs">INCIDENT</Badge>
                    </div>
                    <p class="text-sm text-red-800 whitespace-pre-line">{{ ticket.incidentNotes }}</p>
                  </div>
                </div>
                <Button v-else variant="outline" class="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-xl border font-semibold" @click="incidentDialogOpen = true">
                  <FileWarning class="w-4 h-4 mr-2" /> Tandai sebagai Incident
                </Button>
              </div>
            </div>
          </TabsContent>

          <!-- COMMUNICATION TAB -->
          <TabsContent value="communication" class="m-0 outline-none p-6">
            <div class="border border-slate-200 rounded-xl bg-white overflow-hidden flex flex-col">
              <div class="max-h-[400px] overflow-y-auto bg-slate-50/30">
                <div class="p-6 space-y-6">
                <div v-if="ticket.comments.length === 0" class="text-center py-12 text-slate-400 text-sm">
                  Belum ada pesan.
                </div>
                <div
                  v-for="(comment, i) in ticket.comments"
                  :key="i"
                  :class="[
                    'max-w-[85%] w-fit flex flex-col',
                    comment.role === 'Admin IT' ? 'ml-auto' : 'mr-auto'
                  ]"
                >
                  <div class="flex items-center gap-2 mb-1" :class="comment.role === 'Admin IT' ? 'justify-end' : 'justify-start'">
                    <span class="text-xs font-semibold text-slate-900" v-if="comment.role !== 'Admin IT'">{{ comment.author }}</span>
                    <span class="text-[10px] text-slate-500">{{ formatDateShort(comment.time) }}</span>
                    <span class="text-xs font-semibold text-green-700" v-if="comment.role === 'Admin IT'">{{ comment.author }} (Admin)</span>
                  </div>
                  <div :class="[
                    'p-4 rounded-2xl text-sm leading-relaxed',
                    comment.role === 'Admin IT' 
                      ? 'bg-green-100/50 text-slate-800 rounded-tr-none border border-green-200/60' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                  ]">
                    {{ comment.message }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-6 border-t border-slate-200 bg-white shrink-0">
              <Label class="text-sm font-semibold text-slate-900 mb-2 block">Balas ke User</Label>
              <div class="relative">
                <Textarea v-model="replyText" placeholder="Tambahkan pesan balasan di sini..." class="min-h-[100px] resize-none pr-10 bg-slate-50 border-slate-200 rounded-xl" />
                <Paperclip class="w-5 h-5 text-slate-400 absolute right-3 bottom-3 cursor-pointer hover:text-slate-600" />
              </div>
              <div class="flex justify-end gap-3 mt-4">
                <Button class="bg-green-900 hover:bg-green-950 text-white h-10 px-6 rounded-lg" :disabled="!replyText.trim()" @click="doReply">
                  <Send class="w-4 h-4 mr-2" /> Kirim Balasan
                </Button>
              </div>
            </div>
            </div>
          </TabsContent>

          <!-- AUDIT LOG TAB -->
          <TabsContent value="audit" class="m-0 outline-none p-6">
            <div class="border border-slate-200 rounded-xl bg-white overflow-hidden">
              <div class="max-h-[500px] overflow-y-auto p-8">
              <div class="space-y-0 relative before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:bg-slate-200">
                <div v-for="(log, i) in ticket.auditLog" :key="i" class="relative flex items-center py-4">
                  <!-- Icon -->
                  <div :class="[
                    'flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shrink-0 shadow-sm z-10',
                    log.action.includes('dibuat') ? 'bg-green-200 text-green-700' :
                    log.action.includes('diubah') ? 'bg-blue-100 text-blue-600' :
                    log.action.includes('Incident') ? 'bg-red-100 text-red-600' :
                    log.action.includes('assign') ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-600'
                  ]">
                    <Plus class="w-5 h-5" v-if="log.action.includes('dibuat')" />
                    <History class="w-5 h-5" v-else-if="log.action.includes('diubah')" />
                    <ShieldAlert class="w-5 h-5" v-else-if="log.action.includes('Incident')" />
                    <UserPlus class="w-5 h-5" v-else-if="log.action.includes('assign')" />
                    <CheckCircle2 class="w-5 h-5" v-else />
                  </div>
                  <!-- Card -->
                  <div class="w-[calc(100%-4rem)] ml-6 p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div class="flex flex-col">
                      <p class="font-bold text-slate-900 text-base mb-1">{{ log.action }}</p>
                      <div class="flex items-center gap-2 text-xs text-slate-500">
                        <span>{{ log.user }}</span>
                        <span>•</span>
                        <span>{{ formatDateShort(log.time) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <!-- Right Column: Sidebar -->
      <div class="lg:col-span-1 space-y-6">
        
        <!-- Assigned Technician -->
        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <h3 class="font-bold text-slate-900 text-sm mb-4">Assigned Technician</h3>
          <div v-if="ticket.assignedTo" class="p-4 border border-green-200 bg-green-50/50 rounded-xl flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-500">
                <User class="w-6 h-6" />
              </div>
              <div>
                <p class="font-bold text-slate-900 text-sm">{{ ticket.assignedTo }}</p>
                <p class="text-xs text-slate-500">{{ assigneeSpecialty }}</p>
              </div>
            </div>
            <div class="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center">
              <CheckCircle2 class="w-4 h-4" />
            </div>
          </div>
          <div v-else class="text-center py-6 text-slate-400 text-sm mb-4 border border-dashed rounded-xl">
            Belum ada teknisi yang di-assign
          </div>
          <Button variant="outline" class="w-full border-slate-200 text-green-700 hover:text-green-800 hover:bg-green-50 font-semibold" @click="showAssignForm = true">
            Change Specialist
          </Button>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <h3 class="font-bold text-slate-900 text-sm mb-4">Ticket Overview</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500">SLA Deadline</span>
              <SLATimer :dueDate="new Date(ticket.slaDeadline)" :status="ticket.status" class="text-red-600 text-sm font-semibold" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-500">Category</span>
              <span class="text-sm font-bold text-slate-900">{{ ticket.category }}</span>
            </div>
          </div>
        </div>

        <!-- Evidence -->
        <div class="bg-white border border-slate-200 rounded-xl p-5">
          <h3 class="font-bold text-slate-900 text-sm mb-4">Evidence</h3>
          <div v-if="ticket.attachments?.length > 0" class="grid grid-cols-2 gap-2">
            <div v-for="(file, i) in ticket.attachments" :key="i" class="relative group cursor-pointer border rounded-lg overflow-hidden h-24" @click="selectedImage = file.url; imageDialogOpen = true">
              <img :src="file.url" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div v-else class="border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50">
            <Paperclip class="w-6 h-6 text-slate-400 mb-2" />
            <p class="text-sm font-medium text-slate-500">Belum ada lampiran gambar</p>
          </div>
        </div>

      </div>
    </div>
  </div>

  <div v-else-if="ticketStore.isLoading" class="max-w-7xl mx-auto">
    <TicketDetailSkeleton />
  </div>

  <!-- Incident Dialog -->
  <Dialog v-model:open="incidentDialogOpen">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold text-slate-900">Tandai Tiket sebagai Incident</DialogTitle>
        <DialogDescription class="text-green-600 font-medium">Incident akan dicatat dalam knowledge repository</DialogDescription>
      </DialogHeader>
      <div class="space-y-6 mt-4">
        
        <div class="space-y-3">
          <Label class="font-bold text-slate-900">Severity Level <span class="text-red-500">*</span></Label>
          <div class="grid grid-cols-3 gap-4">
            <div 
              @click="incidentSeverity = 'critical'"
              :class="['border-2 rounded-xl p-4 text-center cursor-pointer transition-all relative bg-white', incidentSeverity === 'critical' ? 'border-red-500 ring-2 ring-red-500 ring-offset-2' : 'border-slate-200 hover:border-slate-300']"
            >
              <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 bg-red-50">
                <AlertTriangle class="w-6 h-6 text-red-600" />
              </div>
              <p class="font-bold text-slate-900 mb-1 text-sm">Critical</p>
              <p class="text-[10px] text-slate-500">Sistem down, banyak user terdampak</p>
            </div>
            
            <div 
              @click="incidentSeverity = 'high'"
              :class="['border-2 rounded-xl p-4 text-center cursor-pointer transition-all relative bg-white', incidentSeverity === 'high' ? 'border-orange-500 ring-2 ring-orange-500 ring-offset-2' : 'border-slate-200 hover:border-slate-300']"
            >
              <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 bg-orange-50">
                <AlertTriangle class="w-6 h-6 text-orange-500" />
              </div>
              <p class="font-bold text-slate-900 mb-1 text-sm">High</p>
              <p class="text-[10px] text-slate-500">Fungsi penting terganggu</p>
            </div>

            <div 
              @click="incidentSeverity = 'medium'"
              :class="['border-2 rounded-xl p-4 text-center cursor-pointer transition-all relative bg-white', incidentSeverity === 'medium' ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' : 'border-slate-200 hover:border-slate-300']"
            >
              <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 bg-blue-50">
                <AlertCircle class="w-6 h-6 text-blue-500" />
              </div>
              <p class="font-bold text-slate-900 mb-1 text-sm">Medium</p>
              <p class="text-[10px] text-slate-500">Gangguan terbatas</p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="font-bold text-slate-900">Deskripsi Incident <span class="text-red-500">*</span></Label>
          <Textarea v-model="incidentDescription" placeholder="Apa yang terjadi? Kapan? Berapa banyak user terdampak?" :rows="3" />
        </div>

        <div class="space-y-2">
          <Label class="font-bold text-slate-900">Root Cause <span class="text-red-500">*</span></Label>
          <Textarea v-model="rootCause" placeholder="Kenapa incident ini terjadi?" :rows="2" />
        </div>

        <div class="space-y-2">
          <Label class="font-bold text-slate-900">Solusi yang Diterapkan <span class="text-red-500">*</span></Label>
          <Textarea v-model="resolution" placeholder="Langkah-langkah penyelesaian..." :rows="3" />
        </div>

        <div class="space-y-2">
          <Label class="font-bold text-slate-900">Tindakan Preventif (Opsional)</Label>
          <Textarea v-model="preventiveAction" placeholder="Langkah mencegah incident serupa..." :rows="2" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label class="text-slate-900 font-semibold">Downtime</Label>
            <Input v-model="downtime" placeholder="Contoh: 6 jam" />
          </div>
          <div class="space-y-2">
            <Label class="text-slate-900 font-semibold">Jumlah User Terdampak</Label>
            <Input v-model="affectedUsers" type="number" placeholder="Contoh: 500" />
          </div>
        </div>
      </div>
      <DialogFooter class="mt-8 flex gap-4">
        <Button variant="outline" class="w-full h-12 text-slate-700 border-slate-300 font-bold" @click="incidentDialogOpen = false">Cancel</Button>
        <Button class="w-full bg-red-500 hover:bg-red-600 text-white h-12 font-bold" @click="doMarkIncident" :disabled="!incidentDescription.trim() || !incidentSeverity || !rootCause.trim() || !resolution.trim()">Simpan sebagai Incident</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Escalate Confirm Dialog -->
  <Dialog v-model:open="escalateDialogOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold text-slate-900">Konfirmasi Escalate</DialogTitle>
        <DialogDescription class="text-slate-600">
          Apakah Anda yakin ingin melakukan eskalasi tiket ini ke tingkat lanjut (In Progress)?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="mt-6 flex gap-3">
        <Button variant="outline" @click="escalateDialogOpen = false" class="border-slate-300">Batal</Button>
        <Button class="bg-blue-600 hover:bg-blue-700 text-white" @click="confirmEscalate">Ya, Escalate</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Image Preview Dialog -->
  <Dialog v-model:open="imageDialogOpen">
    <DialogContent class="max-w-4xl p-1 bg-transparent border-none shadow-none">
      <img :src="selectedImage" class="w-full h-auto rounded-xl object-contain max-h-[85vh]" />
    </DialogContent>
  </Dialog>
</template>
