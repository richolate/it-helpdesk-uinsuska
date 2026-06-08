<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  FileWarning, 
  AlertTriangle,
  Loader2,
  Calendar,
  Sparkles
} from "lucide-vue-next";
import { useNotificationStore } from '@/stores/useNotificationStore';

const router = useRouter();
const notificationStore = useNotificationStore();

const isLoading = ref(true);
const isDeleting = ref<string | null>(null);

// Confirmation state
const showDeleteDialog = ref(false);
const articleIdToDelete = ref<string | null>(null);

const knowledgeArticles = ref<any[]>([]);
const incidentRepository = ref<any[]>([]);

// Filter state
const searchQuery = ref('');
const selectedCategory = ref('all-category');
const selectedStatus = ref('all-status');

// WebSocket Reference
let ws: WebSocket | null = null;
let reconnectTimeout: any = null;

onMounted(async () => {
  await fetchData();
  connectWebSocket();
});

onUnmounted(() => {
  if (ws) {
    ws.close();
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
});

async function fetchData() {
  isLoading.value = true;
  try {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    // Fetch articles
    const artRes = await fetch(`${apiBase}/api/articles`);
    if (artRes.ok) {
      knowledgeArticles.value = await artRes.json();
    }
    
    // Fetch incidents
    const incRes = await fetch(`${apiBase}/api/incidents`);
    if (incRes.ok) {
      incidentRepository.value = await incRes.json();
    }
  } catch (err) {
    console.error('Error fetching data:', err);
    notificationStore.addNotification({
      title: 'Koneksi Eror',
      message: 'Gagal terhubung ke server backend.',
      type: 'error'
    });
  } finally {
    isLoading.value = false;
  }
}

// WebSocket setup for real-time reactive updates
function connectWebSocket() {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
  
  try {
    ws = new WebSocket(wsUrl);
    
    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'articles_updated' || data.event === 'tickets_updated') {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const artRes = await fetch(`${apiBase}/api/articles`);
          if (artRes.ok) {
            knowledgeArticles.value = await artRes.json();
          }
          const incRes = await fetch(`${apiBase}/api/incidents`);
          if (incRes.ok) {
            incidentRepository.value = await incRes.json();
          }
        }
      } catch (e) {
        console.error('[WS] Error processing real-time update:', e);
      }
    };
    
    ws.onclose = () => {
      reconnectTimeout = setTimeout(connectWebSocket, 5000);
    };
  } catch (err) {
    console.error('[WS] Connection error:', err);
    reconnectTimeout = setTimeout(connectWebSocket, 5000);
  }
}

// Compute dynamic stats
const stats = computed(() => [
  { label: "Total Articles", value: knowledgeArticles.value.length, change: "Artikel" },
  { label: "Published", value: knowledgeArticles.value.filter((a) => a.status === "Published").length, change: "Aktif" },
  { label: "Incidents Recorded", value: incidentRepository.value.length, change: "Kasus" },
]);

// Filtered articles list
const filteredArticles = computed(() => {
  return knowledgeArticles.value.filter(art => {
    const query = searchQuery.value.toLowerCase();
    const titleMatch = art.title.toLowerCase().includes(query) ||
                       (art.tags && art.tags.toLowerCase().includes(query)) ||
                       art.content.toLowerCase().includes(query);
    
    let categoryMatch = true;
    if (selectedCategory.value !== 'all-category') {
      categoryMatch = art.category === selectedCategory.value;
    }
    
    let statusMatch = true;
    if (selectedStatus.value !== 'all-status') {
      statusMatch = art.status === selectedStatus.value;
    }
    
    return titleMatch && categoryMatch && statusMatch;
  });
});

// Trigger Custom Dialog
function deleteArticle(id: string) {
  articleIdToDelete.value = id;
  showDeleteDialog.value = true;
}

// Confirmed Deletion from Dialog
async function confirmDelete() {
  if (!articleIdToDelete.value) return;
  const id = articleIdToDelete.value;
  showDeleteDialog.value = false;
  isDeleting.value = id;
  
  try {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiBase}/api/articles/${id}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      notificationStore.addNotification({
        title: 'Artikel Dihapus',
        message: 'Artikel berhasil dihapus dari database.',
        type: 'success'
      });
      await fetchData();
    } else {
      notificationStore.addNotification({
        title: 'Gagal Menghapus',
        message: 'Gagal menghapus artikel.',
        type: 'error'
      });
    }
  } catch (err) {
    console.error(err);
    notificationStore.addNotification({
      title: 'Eror Jaringan',
      message: 'Gagal terhubung ke server.',
      type: 'error'
    });
  } finally {
    isDeleting.value = null;
    articleIdToDelete.value = null;
  }
}

function createNewArticle() {
  router.push('/admin/knowledge/editor');
}

function editArticle(id: string) {
  router.push(`/admin/knowledge/editor/${id}`);
}

function viewArticle(id: string) {
  router.push(`/admin/knowledge/view/${id}`);
}

function viewOriginalTicket(ticketId: string) {
  router.push(`/admin/tickets/${ticketId}`);
}

function convertIncidentToArticle(incident: any) {
  router.push({
    path: '/admin/knowledge/editor',
    query: {
      title: `Solusi: ${incident.title}`,
      content: `### Deskripsi Incident:\n${incident.description}\n\n### Analisis Masalah:\n${incident.incidentNotes || ''}\n\n### Langkah-Langkah Solusi:\n1. [Tulis solusi di sini...]`,
      category: incident.category,
      relatedIncidentId: incident.id
    }
  });
}

function getTagsArray(tagsStr: string) {
  if (!tagsStr) return [];
  return tagsStr.split(',').map(t => t.trim()).filter(Boolean);
}

function formatDate(iso: string) {
  if (!iso) return '-';
  const d = new Date(iso.replace('Z', ''));
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
</script>

<template>
<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Knowledge Management</h2>
      <p class="text-slate-600 mt-1">Kelola artikel, solusi, dan dokumentasi IT</p>
    </div>
    <Button class="bg-green-700 hover:bg-green-800 text-white font-bold gap-2 rounded-xl px-5 py-3 shadow-md" @click="createNewArticle">
      <Plus class="w-4.5 h-4.5" />
      Create Article
    </Button>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <template v-if="isLoading">
      <Card v-for="i in 3" :key="i" class="border border-slate-200/60 shadow-sm rounded-2xl bg-white">
        <CardContent class="pt-6">
          <div class="space-y-2">
            <div class="h-4 w-24 bg-slate-200/60 animate-pulse rounded"></div>
            <div class="h-8 w-16 bg-slate-200/60 animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    </template>
    <template v-else>
      <Card v-for="stat in stats" :key="stat.label" class="border border-slate-200/60 shadow-sm rounded-2xl bg-white">
        <CardContent class="pt-6">
          <p class="text-sm text-slate-500 font-bold mb-1.5">{{ stat.label }}</p>
          <div class="flex items-baseline gap-2">
            <p class="text-3xl font-extrabold text-slate-900">{{ stat.value }}</p>
            <span class="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">{{ stat.change }}</span>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>

  <!-- Tabs -->
  <Tabs defaultValue="articles" class="space-y-4">
    <TabsList class="bg-slate-100 p-1 rounded-xl">
      <TabsTrigger value="articles" class="rounded-lg font-bold">
        Knowledge Articles ({{ knowledgeArticles.length }})
      </TabsTrigger>
      <TabsTrigger value="incidents" class="rounded-lg font-bold gap-2">
        <FileWarning class="w-4 h-4" />
        Incident Repository ({{ incidentRepository.length }})
      </TabsTrigger>
    </TabsList>

    <!-- Knowledge Articles Tab -->
    <TabsContent value="articles" class="space-y-4 outline-none">
      <!-- Search and Filter -->
      <Card class="border border-slate-200/60 shadow-sm bg-white rounded-2xl">
        <CardContent class="pt-6">
          <div class="grid md:grid-cols-4 gap-4">
            <div class="md:col-span-2">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Cari artikel berdasarkan judul atau tag..." class="pl-10 rounded-xl" v-model="searchQuery" />
              </div>
            </div>
            <Select v-model="selectedCategory">
              <SelectTrigger class="rounded-xl border-slate-200 font-semibold text-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-category">Semua Kategori</SelectItem>
                <SelectItem value="Jaringan">Jaringan</SelectItem>
                <SelectItem value="Akun">Akun</SelectItem>
                <SelectItem value="Perangkat">Perangkat</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Infrastruktur">Infrastruktur</SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="selectedStatus">
              <SelectTrigger class="rounded-xl border-slate-200 font-semibold text-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">Semua Status</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <!-- Articles Grid -->
      <div v-if="isLoading" class="grid md:grid-cols-2 gap-6">
        <div v-for="i in 4" :key="i" class="h-64 bg-slate-100/50 animate-pulse rounded-2xl w-full border border-slate-200/30"></div>
      </div>
      <div v-else-if="filteredArticles.length === 0" class="text-center py-20 bg-white rounded-2xl border border-slate-200/60">
        <BookOpen class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="font-bold text-slate-800">Tidak ada artikel ditemukan</p>
        <p class="text-sm text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau buat artikel baru.</p>
      </div>
      <div v-else class="grid md:grid-cols-2 gap-6">
        <Card v-for="article in filteredArticles" :key="article.id" class="hover:shadow-md transition-shadow bg-white border border-slate-200/60 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader class="pb-3">
              <div class="flex items-start justify-between mb-2">
                <Badge variant="outline" class="bg-green-50 text-green-700 border-green-200/60 font-extrabold px-3 py-1 text-xs rounded-full shadow-sm">
                  {{ article.category }}
                </Badge>
                <Badge
                  variant="outline"
                  :class="[
                    article.status === 'Published'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  ]"
                  class="font-extrabold text-xs px-2.5 py-0.5 rounded font-sans shadow-sm"
                >
                  {{ article.status }}
                </Badge>
              </div>
              <!-- Clean aligned header font size -->
              <CardTitle class="text-sm md:text-base font-semibold text-slate-900 leading-snug line-clamp-2 hover:text-green-700 cursor-pointer pt-1" @click="viewArticle(article.id)">
                {{ article.title }}
              </CardTitle>
              <CardDescription class="text-sm text-slate-400 mt-1.5 font-medium">
                By {{ article.author?.name || 'Admin IT' }} • {{ formatDate(article.createdAt) }}
              </CardDescription>
            </CardHeader>
            
            <CardContent class="space-y-4 pb-4">
              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5" v-if="getTagsArray(article.tags).length > 0">
                <Badge v-for="tag in getTagsArray(article.tags)" :key="tag" variant="secondary" class="text-sm bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-3.5 py-1.5 font-bold shadow-sm">
                  {{ tag }}
                </Badge>
              </div>
              
              <!-- Modern & Elegant View Pill Stats Bar -->
              <div class="flex items-center justify-between py-2.5 border-t border-slate-100 mt-3 text-xs">
                <div class="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-50/50 border border-green-100/50 rounded-full text-green-800 font-extrabold shadow-sm">
                  <Eye class="w-3.5 h-3.5 text-green-600 animate-pulse" />
                  <span>{{ article.views }} Dibaca</span>
                </div>
                <span class="text-slate-400 font-semibold">Diupdate: {{ formatDate(article.updatedAt) }}</span>
              </div>
            </CardContent>
          </div>

          <!-- Actions Footer (Bold explicit fonts) -->
          <div class="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/20 flex gap-2">
            <Button variant="outline" size="sm" class="flex-1 rounded-xl text-slate-800 border-slate-200 hover:bg-slate-100 font-bold border" @click="viewArticle(article.id)">
              <Eye class="w-4 h-4 mr-2" />
              View
            </Button>
            <Button variant="outline" size="sm" class="flex-1 rounded-xl text-slate-800 border-slate-200 hover:bg-slate-100 font-bold border" @click="editArticle(article.id)">
              <Edit class="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" class="rounded-xl hover:bg-red-50 text-red-600" :disabled="isDeleting === article.id" @click="deleteArticle(article.id)">
              <Loader2 v-if="isDeleting === article.id" class="w-4 h-4 animate-spin text-red-600" />
              <Trash2 v-else class="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </TabsContent>

    <!-- Incident Repository Tab -->
    <TabsContent value="incidents" class="space-y-4 outline-none">
      <!-- Info Box -->
      <div class="p-4 bg-red-50 border border-red-200 rounded-2xl">
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-bold text-red-900 text-sm">Incident Repository</p>
            <p class="text-xs text-red-800 mt-1 leading-relaxed">
              Daftar tiket yang telah ditandai sebagai incident oleh admin. Incident ini dicatat secara dinamis dari database untuk mempermudah perbaikan sistem, post-mortem, dan dokumentasi penyusunan solusi di Knowledge Base.
            </p>
          </div>
        </div>
      </div>

      <Card class="border border-slate-200/60 shadow-sm bg-white rounded-2xl">
        <CardHeader class="border-b border-slate-100">
          <CardTitle class="text-lg font-bold text-slate-900">Incident Repository</CardTitle>
          <CardDescription>
            Catatan kasus dan incident aktif maupun resolved dari database
          </CardDescription>
        </CardHeader>
        
        <div v-if="isLoading" class="space-y-4 p-6">
          <div v-for="i in 2" :key="i" class="h-[180px] bg-slate-100/50 animate-pulse rounded-2xl w-full border border-slate-200/30"></div>
        </div>
        <CardContent v-else class="p-6 space-y-6">
          <div v-for="incident in incidentRepository" :key="incident.id" class="p-5 border-2 border-red-100 rounded-2xl hover:bg-red-50/10 transition-colors space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <Badge class="bg-red-600 text-white font-extrabold px-2.5 py-1 rounded text-xs">
                    INCIDENT
                  </Badge>
                  <Badge variant="outline" class="bg-slate-50 text-slate-700 font-bold">
                    Tiket {{ incident.id }}
                  </Badge>
                  <Badge
                    variant="outline"
                    :class="[
                      incident.priority === 'High'
                        ? 'bg-red-50 text-red-700 border-red-300'
                        : incident.priority === 'Medium'
                        ? 'bg-orange-50 text-orange-700 border-orange-300'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                    ]"
                    class="font-extrabold text-xs rounded"
                  >
                    {{ incident.priority }}
                  </Badge>
                  <Badge variant="outline" class="bg-green-50 text-green-700 border-green-200 font-extrabold px-3 py-1 text-xs rounded-full">
                    {{ incident.category }}
                  </Badge>
                </div>
                <h3 class="font-extrabold text-slate-900 text-xl pt-1.5 leading-tight">{{ incident.title }}</h3>
                <div class="flex items-center gap-4 text-xs text-slate-400 pt-1 font-semibold">
                  <span>Pelapor: <strong>{{ incident.requester?.name || 'User' }}</strong></span>
                  <span>•</span>
                  <span>Tanggal Masuk: {{ formatDate(incident.createdAt) }}</span>
                </div>
              </div>
              
              <Badge 
                :class="[
                  incident.status === 'Resolved' || incident.status === 'Closed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                ]" 
                class="font-extrabold rounded-full self-start px-3 py-1 text-xs"
              >
                {{ incident.status }}
              </Badge>
            </div>

            <!-- Problem Details & Notes -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-slate-100">
              <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-200/40">
                <p class="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                  Detail Laporan Tiket
                </p>
                <p class="text-slate-600 line-clamp-3 text-xs leading-relaxed font-semibold">{{ incident.description }}</p>
              </div>

              <div class="p-3 bg-red-50/20 rounded-xl border border-red-100/40">
                <p class="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Catatan Analisis Incident
                </p>
                <p class="text-slate-600 line-clamp-3 text-xs leading-relaxed font-semibold">
                  {{ incident.incidentNotes || 'Belum ada catatan analisis incident tambahan dari admin.' }}
                </p>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm" class="flex-1 rounded-xl text-green-800 hover:text-green-900 hover:bg-green-50 border-green-200 border gap-1.5 font-bold text-xs" @click="convertIncidentToArticle(incident)">
                <Sparkles class="w-3.5 h-3.5" />
                Convert to Knowledge Article
              </Button>
              <Button variant="outline" size="sm" class="flex-1 rounded-xl text-slate-800 border-slate-200 hover:bg-slate-100 font-bold border text-xs" @click="viewOriginalTicket(incident.id)">
                <Eye class="w-3.5 h-3.5 mr-1.5" />
                View Original Ticket
              </Button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="incidentRepository.length === 0" class="text-center py-12 text-slate-500">
            <FileWarning class="w-16 h-16 mx-auto mb-3 text-slate-300" />
            <p class="font-bold text-slate-800">Belum ada incident yang dicatat</p>
            <p class="text-sm text-slate-500 mt-1">
              Kasus incident akan muncul otomatis di sini ketika tiket ditandai sebagai incident oleh admin.
            </p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>

  <!-- Premium Custom Deletion Confirmation Dialog -->
  <Dialog v-model:open="showDeleteDialog">
    <DialogContent class="max-w-md rounded-2xl">
      <DialogHeader class="flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3 border border-red-200/20">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <DialogTitle class="text-slate-900 text-lg font-bold">Hapus Artikel</DialogTitle>
        <DialogDescription class="text-slate-500 text-sm mt-2">
          Apakah Anda yakin ingin menghapus artikel ini? Artikel yang dihapus tidak dapat dipulihkan kembali.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="grid grid-cols-2 gap-2 mt-4">
        <Button 
          variant="outline" 
          class="rounded-xl font-bold border-slate-200 text-slate-800" 
          @click="showDeleteDialog = false"
        >
          Batal
        </Button>
        <Button 
          variant="destructive" 
          class="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2"
          @click="confirmDelete"
        >
          Hapus
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
</template>
