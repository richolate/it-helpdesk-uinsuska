<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  BookOpen, 
  Wifi, 
  Lock, 
  Laptop, 
  HelpCircle, 
  TrendingUp, 
  Calendar, 
  Eye, 
  Terminal, 
  Server,
  Layers,
  ChevronRight,
  Loader2
} from "lucide-vue-next";
import { useNotificationStore } from '@/stores/useNotificationStore';

const router = useRouter();
const notificationStore = useNotificationStore();

const isLoading = ref(true);
const articles = ref<any[]>([]);

// Filter states
const searchQuery = ref("");
const selectedCategory = ref("Semua");

const categoriesList = [
  { name: "Semua", icon: Layers, color: "text-green-700", bgColor: "bg-green-50" },
  { name: "Jaringan", icon: Wifi, color: "text-blue-700", bgColor: "bg-blue-50" },
  { name: "Akun", icon: Lock, color: "text-orange-700", bgColor: "bg-orange-50" },
  { name: "Perangkat", icon: Laptop, color: "text-purple-700", bgColor: "bg-purple-50" },
  { name: "Software", icon: Terminal, color: "text-red-700", bgColor: "bg-red-50" },
  { name: "Infrastruktur", icon: Server, color: "text-indigo-700", bgColor: "bg-indigo-50" }
];

// WebSocket References
let ws: WebSocket | null = null;
let reconnectTimeout: any = null;

onMounted(async () => {
  await fetchArticles();
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

async function fetchArticles() {
  isLoading.value = true;
  try {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiBase}/api/articles?status=Published`);
    if (res.ok) {
      articles.value = await res.json();
    }
  } catch (err) {
    console.error('Error fetching articles:', err);
    notificationStore.addNotification({
      title: 'Koneksi Eror',
      message: 'Gagal memuat artikel dari database.',
      type: 'error'
    });
  } finally {
    isLoading.value = false;
  }
}

// WebSocket setup to receive live updates
function connectWebSocket() {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
  
  try {
    ws = new WebSocket(wsUrl);
    
    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'articles_updated') {
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const res = await fetch(`${apiBase}/api/articles?status=Published`);
          if (res.ok) {
            articles.value = await res.json();
          }
        }
      } catch (e) {
        console.error('[WS] Error processing real-time article update:', e);
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

// Filtered articles list from database
const filteredArticles = computed(() => {
  return articles.value.filter(art => {
    const query = searchQuery.value.toLowerCase();
    const titleMatch = art.title.toLowerCase().includes(query) ||
                       (art.tags && art.tags.toLowerCase().includes(query)) ||
                       art.content.toLowerCase().includes(query);
                       
    const categoryMatch = selectedCategory.value === "Semua" || art.category === selectedCategory.value;
    
    return titleMatch && categoryMatch;
  });
});

// Popular articles
const popularArticles = computed(() => {
  return [...articles.value]
    .sort((a, b) => b.views - a.views)
    .slice(0, 4);
});

function viewArticle(id: string) {
  router.push(`/user/knowledge/view/${id}`);
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

// Static FAQ Data
const faqs = [
  {
    category: "Jaringan",
    items: [
      {
        question: "Bagaimana cara connect ke WiFi kampus?",
        answer: "Untuk connect ke WiFi kampus: 1) Pilih network 'Univ-WiFi' dari daftar WiFi. 2) Masukkan username dan password akun iRaise Anda. 3) Jika diminta sertifikat, klik 'Terima'. 4) Tunggu hingga koneksi berhasil. Jika masih bermasalah, pastikan device Anda sudah terdaftar di sistem.",
      },
      {
        question: "Apa yang harus dilakukan jika WiFi terputus-putus?",
        answer: "Jika WiFi terputus-putus: 1) Coba pindah ke access point lain yang lebih dekat. 2) Forget network dan connect ulang. 3) Restart device Anda. 4) Update driver WiFi ke versi terbaru. 5) Jika masih bermasalah, hubungi IT Helpdesk dengan menyertakan lokasi dan waktu kejadian.",
      },
      {
        question: "Bagaimana cara mengakses jaringan kampus dari luar?",
        answer: "Untuk akses dari luar kampus: 1) Download dan install aplikasi VPN dari portal IT. 2) Login menggunakan akun iRaise. 3) Connect ke VPN sebelum mengakses resource kampus. 4) Pastikan koneksi internet Anda stabil. Panduan lengkap tersedia di portal IT.",
      },
    ],
  },
  {
    category: "Akun",
    items: [
      {
        question: "Bagaimana cara reset password iRaise?",
        answer: "Untuk reset password iRaise: 1) Kunjungi portal.university.ac.id/reset. 2) Masukkan NIM/NIP Anda. 3) Klik link verifikasi yang dikirim ke email. 4) Buat password baru (min 8 karakter, kombinasi huruf besar, kecil, angka, dan simbol). 5) Login dengan password baru. Jika tidak menerima email, cek folder spam atau hubungi helpdesk.",
      },
      {
        question: "Berapa lama password iRaise berlaku?",
        answer: "Password iRaise berlaku selama 90 hari. Sistem akan mengirimkan notifikasi 7 hari sebelum expired. Anda harus mengganti password sebelum expired untuk menghindari account lockout. Gunakan password yang kuat dan berbeda dari password sebelumnya.",
      },
      {
        question: "Akun saya terkunci, bagaimana cara membukanya?",
        answer: "Akun akan terkunci setelah 5x salah password. Untuk unlock: 1) Tunggu 30 menit untuk auto-unlock. 2) Atau hubungi IT Helpdesk dengan membawa KTM/kartu identitas. 3) Verifikasi identitas akan dilakukan sebelum unlock. Untuk keamanan, jangan share password Anda dengan siapapun.",
      },
    ],
  },
  {
    category: "Perangkat",
    items: [
      {
        question: "Bagaimana cara mendaftarkan laptop/device baru?",
        answer: "Untuk registrasi device baru: 1) Login ke portal.university.ac.id/devices. 2) Klik 'Tambah Device Baru'. 3) Masukkan MAC address device (bisa dicek di network settings). 4) Isi informasi device (tipe, merk, model). 5) Tunggu approval dari IT (max 1x24 jam). Device yang sudah approved bisa langsung connect ke jaringan.",
      },
      {
        question: "Berapa maksimal device yang bisa didaftarkan?",
        answer: "Setiap user dapat mendaftarkan maksimal 3 device aktif. Jika ingin menambah device baru saat kuota penuh, hapus salah satu device lama terlebih dahulu. Untuk kebutuhan khusus (penelitian, dll), ajukan permohonan tambahan kuota ke IT Helpdesk dengan surat keterangan.",
      },
    ],
  },
  {
    category: "Umum",
    items: [
      {
        question: "Bagaimana cara mengajukan tiket ke IT Helpdesk?",
        answer: "Untuk mengajukan tiket: 1) Login ke portal helpdesk. 2) Klik 'Buat Tiket Baru'. 3) Pilih kategori yang sesuai. 4) Isi judul dan deskripsi masalah dengan detail. 5) Upload screenshot jika diperlukan. 6) Submit tiket. Anda akan menerima nomor tiket dan notifikasi via email. Track status tiket di menu 'Tiket Saya'.",
      },
      {
        question: "Berapa lama waktu penanganan tiket?",
        answer: "SLA penanganan tiket: Priority High: 4 jam, Priority Medium: 8 jam, Priority Low: 24 jam. Waktu dihitung dari jam kerja (Senin-Jumat, 08:00-16:00). Untuk urgent issue di luar jam kerja, hubungi hotline emergency IT: 0800-123-4567.",
      },
      {
        question: "Di mana lokasi IT Helpdesk?",
        answer: "IT Helpdesk berlokasi di Gedung Rektorat Lt. 1, Ruang IT Support. Jam operasional: Senin-Jumat: 08:00-16:00, Sabtu: 08:00-12:00. Untuk layanan tatap muka, silakan datang langsung dengan membawa KTM/identitas. Atau hubungi: Telepon: (021) 1234-5678, Email: helpdesk@university.ac.id.",
      },
    ],
  },
];

const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqs;

  const query = searchQuery.value.toLowerCase();
  return faqs
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      ),
    }))
    .filter((category) => category.items.length > 0);
});
</script>

<template>
<div class="space-y-8">
  <div>
    <h2 class="text-2xl font-bold text-slate-900">Knowledge Base</h2>
    <p class="text-slate-600 mt-1">Temukan solusi untuk masalah umum dan panduan self-service</p>
  </div>

  <!-- Search Bar -->
  <Card class="border border-slate-200/60 shadow-sm rounded-2xl bg-white">
    <CardContent class="pt-6">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Cari artikel, panduan, atau FAQ..."
          class="pl-12 h-12 text-base rounded-xl border-slate-200 focus:border-green-600 font-semibold"
          v-model="searchQuery"
        />
      </div>
    </CardContent>
  </Card>

  <!-- Categories Tabs Grid -->
  <div>
    <h3 class="text-lg font-bold text-slate-900 mb-4">Kategori</h3>
    <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
      <div 
        v-for="cat in categoriesList" 
        :key="cat.name" 
        class="border rounded-2xl p-4 cursor-pointer select-none transition-all duration-200 text-center flex flex-col items-center justify-center gap-2"
        :class="[
          selectedCategory === cat.name
            ? 'border-green-600 bg-green-50/30 text-green-900 font-bold shadow-sm'
            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:shadow-sm'
        ]"
        @click="selectedCategory = cat.name"
      >
        <div :class="[cat.bgColor, 'w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm']">
          <component :is="cat.icon" :class="['w-5 h-5', cat.color]" />
        </div>
        <span class="text-xs font-bold">{{ cat.name }}</span>
      </div>
    </div>
  </div>

  <!-- Main Articles Layout -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Articles List (Left 2 columns) -->
    <div class="lg:col-span-2 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-slate-900">
          Artikel {{ selectedCategory === 'Semua' ? 'Terbaru' : selectedCategory }}
        </h3>
        <span class="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-full shadow-sm">
          {{ isLoading ? '...' : filteredArticles.length }} artikel
        </span>
      </div>

      <!-- High-fidelity Premium Skeleton Loader -->
      <div v-if="isLoading" class="space-y-4 animate-pulse">
        <div v-for="i in 3" :key="i" class="flex flex-col sm:flex-row gap-4 p-5 bg-white border border-slate-200/40 rounded-2xl w-full">
          <div class="w-full sm:w-24 h-24 bg-slate-100 rounded-xl flex-shrink-0"></div>
          <div class="flex-1 space-y-3 pt-2">
            <div class="h-4 bg-slate-100 rounded w-1/4"></div>
            <div class="h-5 bg-slate-100 rounded w-3/4"></div>
            <div class="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <div v-else-if="filteredArticles.length === 0" class="text-center py-16 bg-white border border-slate-200/60 rounded-2xl">
        <BookOpen class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="font-bold text-slate-800">Tidak ada artikel di kategori ini</p>
        <p class="text-sm text-slate-500 mt-1">Silakan pilih kategori lain atau gunakan bilah pencarian.</p>
      </div>

      <div v-else class="space-y-4 animate-fade-in">
        <div
          v-for="article in filteredArticles"
          :key="article.id"
          class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white border border-slate-200/60 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
          @click="viewArticle(article.id)"
        >
          <!-- Article Cover Thumbnail -->
          <div class="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-150 flex items-center justify-center">
            <img 
              v-if="article.coverImage"
              :src="article.coverImage" 
              alt="Thumbnail" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <BookOpen v-else class="w-6 h-6 text-slate-300" />
          </div>

          <!-- Article Text Info -->
          <div class="flex-1 min-w-0 space-y-2">
            <div class="flex items-center gap-2">
              <Badge variant="outline" class="bg-green-50 text-green-700 border-green-200 font-extrabold px-3 py-1 rounded-full text-xs shadow-sm">
                {{ article.category }}
              </Badge>
              <div class="flex flex-wrap gap-1" v-if="getTagsArray(article.tags).length > 0">
                <span v-for="tag in getTagsArray(article.tags).slice(0, 2)" :key="tag" class="text-sm text-slate-500 font-bold">
                  #{{ tag }}
                </span>
              </div>
            </div>
            
            <!-- Dynamic header font (anti ceper) -->
            <h4 class="text-sm md:text-base font-semibold text-slate-900 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug">
              {{ article.title }}
            </h4>
            
            <!-- Modern views and calendar display -->
            <div class="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
              <div class="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-100/60 rounded-full text-green-800 font-extrabold shadow-sm">
                <Eye class="w-3.5 h-3.5 text-green-600 animate-pulse animate-duration-1000" />
                <span>{{ article.views }} views</span>
              </div>
              <span>•</span>
              <span class="flex items-center gap-1 font-semibold text-slate-400">
                <Calendar class="w-4 h-4 text-slate-450" />
                {{ formatDate(article.createdAt) }}
              </span>
            </div>
          </div>

          <ChevronRight class="w-5 h-5 text-slate-300 group-hover:text-green-700 group-hover:translate-x-1 transition-all hidden sm:block" />
        </div>
      </div>
    </div>

    <!-- Popular Articles -->
    <div class="space-y-4">
      <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <TrendingUp class="w-5 h-5 text-green-700" />
        Artikel Populer
      </h3>

      <div v-if="isLoading" class="space-y-3 animate-pulse">
        <div v-for="i in 2" :key="i" class="h-24 bg-slate-100/50 rounded-2xl w-full border border-slate-200/30"></div>
      </div>

      <div v-else class="space-y-3 animate-fade-in">
        <div
          v-for="article in popularArticles"
          :key="article.id"
          class="flex items-start gap-3 p-4 bg-white border border-slate-200/60 rounded-2xl hover:shadow-sm transition-shadow cursor-pointer"
          @click="viewArticle(article.id)"
        >
          <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 text-green-700 border border-green-100/30">
            <BookOpen class="w-4 h-4" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-slate-800 text-sm line-clamp-2 leading-snug hover:text-green-700">
              {{ article.title }}
            </h4>
            <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
              <span class="font-bold text-slate-500">{{ article.category }}</span>
              <span>•</span>
              <span class="flex items-center gap-0.5 text-green-700 font-bold">
                <Eye class="w-3 h-3" />
                {{ article.views }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- FAQ Section (Enlarged and optimized text sizes) -->
  <Card class="border border-slate-200/60 shadow-sm bg-white rounded-2xl">
    <CardHeader class="border-b border-slate-100 py-5">
      <CardTitle class="text-xl font-bold text-slate-900">Frequently Asked Questions (FAQ)</CardTitle>
      <CardDescription class="text-sm font-medium text-slate-500 mt-1">
        <template v-if="searchQuery">Menampilkan hasil pencarian untuk "{{ searchQuery }}"</template>
        <template v-else>Pertanyaan yang sering diajukan</template>
      </CardDescription>
    </CardHeader>
    <CardContent class="p-6">
      <div v-for="category in filteredFaqs" :key="category.category" class="mb-6 last:mb-0">
        <!-- Enlarged Category Title -->
        <h3 class="font-extrabold text-slate-900 text-base md:text-lg mb-4 flex items-center gap-2">
          <div class="w-1 h-5 bg-green-700 rounded-full"></div>
          {{ category.category }}
        </h3>
        
        <!-- Enlarged Accordion Items -->
        <Accordion type="single" collapsible class="space-y-3">
          <AccordionItem
            v-for="(item, index) in category.items"
            :key="index"
            :value="`${category.category}-${index}`"
            class="border border-slate-200 rounded-xl px-5 bg-white shadow-sm hover:border-slate-300 transition-colors"
          >
            <!-- Large and Readable Trigger -->
            <AccordionTrigger class="hover:no-underline text-left py-4 font-bold text-slate-800 text-[15px] sm:text-base leading-snug hover:text-green-700 transition-colors">
              <span>{{ item.question }}</span>
            </AccordionTrigger>
            <!-- Readable Content Body -->
            <AccordionContent class="text-slate-650 text-sm leading-relaxed pt-2 pb-5 border-t border-slate-50">
              {{ item.answer }}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div v-if="filteredFaqs.length === 0" class="text-center py-12">
        <HelpCircle class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="font-bold text-slate-800">Tidak ada FAQ yang cocok</p>
        <p class="text-sm text-slate-400 mt-1">Coba kata kunci pencarian yang lain.</p>
      </div>
    </CardContent>
  </Card>

  <!-- Help Card (Aesthetic Redesigned router-link button) -->
  <Card class="bg-gradient-to-r from-green-50 to-emerald-50/40 border border-green-100 rounded-2xl shadow-sm">
    <CardContent class="p-6">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div class="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-green-700/20">
          <HelpCircle class="w-6 h-6" />
        </div>
        <div class="flex-1">
          <h4 class="font-extrabold text-slate-900 text-base mb-1">Tidak menemukan solusi?</h4>
          <p class="text-sm text-slate-650 font-medium">
            Jika Anda tidak menemukan jawaban di Knowledge Base atau FAQ, silakan buat tiket bantuan baru dan tim IT kami akan segera membantu Anda.
          </p>
        </div>
        <router-link to="/user/submit-ticket" class="flex-shrink-0">
          <Button class="bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl px-5 py-3.5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
            Buat Tiket Baru
          </Button>
        </router-link>
      </div>
    </CardContent>
  </Card>
</div>
</template>
