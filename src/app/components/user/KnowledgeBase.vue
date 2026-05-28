<script setup lang="ts">
import { ref, computed } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, Wifi, Lock, Laptop, HelpCircle, TrendingUp } from "lucide-vue-next";

const searchQuery = ref("");

const categories = [
  {
    name: "Jaringan",
    icon: Wifi,
    color: "text-green-700",
    bgColor: "bg-green-50",
    articles: 12,
  },
  {
    name: "Akun & Password",
    icon: Lock,
    color: "text-green-600",
    bgColor: "bg-green-50",
    articles: 8,
  },
  {
    name: "Perangkat",
    icon: Laptop,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    articles: 15,
  },
  {
    name: "Umum",
    icon: HelpCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    articles: 10,
  },
];

const popularArticles = [
  {
    id: 1,
    title: "Cara mengatasi tidak bisa connect ke WiFi kampus",
    category: "Jaringan",
    views: 1254,
    helpful: 98,
  },
  {
    id: 2,
    title: "Reset password akun iRaise",
    category: "Akun & Password",
    views: 892,
    helpful: 95,
  },
  {
    id: 3,
    title: "Cara install VPN untuk akses jaringan kampus dari rumah",
    category: "Jaringan",
    views: 756,
    helpful: 92,
  },
  {
    id: 4,
    title: "Troubleshooting laptop tidak terdeteksi di jaringan",
    category: "Perangkat",
    views: 643,
    helpful: 88,
  },
];

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
    category: "Akun & Password",
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

  <!-- Search -->
  <Card>
    <CardContent class="pt-6">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Cari artikel, panduan, atau FAQ..."
          class="pl-12 h-12 text-base"
          v-model="searchQuery"
        />
      </div>
    </CardContent>
  </Card>

  <!-- Categories -->
  <div>
    <h3 class="text-lg font-semibold text-slate-900 mb-4">Kategori</h3>
    <div class="grid md:grid-cols-4 gap-4">
      <Card v-for="category in categories" :key="category.name" class="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent class="pt-6">
          <div :class="[category.bgColor, 'w-12 h-12 rounded-lg flex items-center justify-center mb-3']">
            <component :is="category.icon" :class="['w-6 h-6', category.color]" />
          </div>
          <h4 class="font-semibold text-slate-900 mb-1">{{ category.name }}</h4>
          <p class="text-sm text-slate-500">{{ category.articles }} artikel</p>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Popular Articles -->
  <Card>
    <CardHeader>
      <div class="flex items-center gap-2">
        <TrendingUp class="w-5 h-5 text-green-700" />
        <CardTitle>Artikel Populer</CardTitle>
      </div>
      <CardDescription>Artikel yang paling sering dibaca</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        <div
          v-for="article in popularArticles"
          :key="article.id"
          class="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen class="w-5 h-5 text-green-700" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-slate-900 mb-1">{{ article.title }}</h4>
            <div class="flex items-center gap-3 text-sm text-slate-500">
              <Badge variant="outline" class="bg-slate-50">
                {{ article.category }}
              </Badge>
              <span>👁 {{ article.views }} views</span>
              <span>👍 {{ article.helpful }}% helpful</span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- FAQ -->
  <Card>
    <CardHeader>
      <CardTitle>Frequently Asked Questions (FAQ)</CardTitle>
      <CardDescription>
        <template v-if="searchQuery">Menampilkan hasil pencarian untuk "{{ searchQuery }}"</template>
        <template v-else>Pertanyaan yang sering diajukan</template>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div v-for="category in filteredFaqs" :key="category.category" class="mb-6 last:mb-0">
        <h3 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <div class="w-1.5 h-6 bg-green-700 rounded-full"></div>
          {{ category.category }}
        </h3>
        <Accordion type="single" collapsible class="space-y-2">
          <AccordionItem
            v-for="(item, index) in category.items"
            :key="index"
            :value="`${category.category}-${index}`"
            class="border border-slate-200 rounded-lg px-4 bg-white"
          >
            <AccordionTrigger class="hover:no-underline text-left">
              <span class="font-medium text-slate-900">{{ item.question }}</span>
            </AccordionTrigger>
            <AccordionContent class="text-slate-600 leading-relaxed pt-2">
              {{ item.answer }}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div v-if="filteredFaqs.length === 0" class="text-center py-12">
        <BookOpen class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="text-slate-500">Tidak ada hasil untuk "{{ searchQuery }}"</p>
        <p class="text-sm text-slate-400 mt-1">Coba kata kunci lain atau hubungi IT Helpdesk</p>
      </div>
    </CardContent>
  </Card>

  <!-- Help Card -->
  <Card class="bg-green-50 border-green-200">
    <CardContent class="pt-6">
      <div class="flex gap-4">
        <div class="w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <HelpCircle class="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 class="font-semibold text-slate-900 mb-2">Tidak menemukan solusi?</h4>
          <p class="text-sm text-slate-600 mb-3">
            Jika Anda tidak menemukan jawaban di Knowledge Base, silakan buat tiket baru dan tim IT kami akan membantu Anda.
          </p>
          <a href="/user/submit-ticket">
            <button class="text-sm font-medium text-green-700 hover:text-green-800">
              Buat Tiket Baru →
            </button>
          </a>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
</template>
