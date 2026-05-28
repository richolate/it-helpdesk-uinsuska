<script setup lang="ts">
import { ref, computed } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle, Globe, GraduationCap, User, Monitor, Cloud, MoreHorizontal } from "lucide-vue-next";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/composables/useAuth";
import { useTicketStore, type TicketCategory, type TicketPriority } from "@/stores/useTicketStore";

const auth = useAuth();
const ticketStore = useTicketStore();
const currentUser = computed(() => auth.getCurrentUser());

// ─── Form state ──────────────────────────────────────────────────────────────

const title = ref('');
const category = ref<TicketCategory | ''>('');
const priority = ref<TicketPriority>('Medium');
const description = ref('');
const location = ref('');
const phone = ref('');
const files = ref<File[]>([]);
const isDragging = ref(false);

const categoryOptions = [
  { value: 'Jaringan', label: 'Jaringan', icon: Globe },
  { value: 'iRaise', label: 'iRaise', icon: GraduationCap },
  { value: 'Akun', label: 'Akun', icon: User },
  { value: 'Perangkat', label: 'Perangkat', icon: Monitor },
  { value: 'Software', label: 'Software', icon: Cloud },
  { value: 'Lainnya', label: 'Lainnya', icon: MoreHorizontal },
];

const priorityOptions = [
  { value: 'Low', label: 'Low', color: 'bg-blue-500', activeClass: 'bg-blue-50 border border-blue-300 text-blue-700 font-semibold shadow-sm' },
  { value: 'Medium', label: 'Medium', color: 'bg-green-500', activeClass: 'bg-green-50 border border-green-400 text-green-700 font-semibold shadow-sm' },
  { value: 'High', label: 'High', color: 'bg-red-500', activeClass: 'bg-red-50 border border-red-300 text-red-700 font-semibold shadow-sm' },
];

// ─── UI state ─────────────────────────────────────────────────────────────────

const submitted = ref(false);
const submittedId = ref('');
const isLoading = ref(false);
const formError = ref('');

// ─── File handling ────────────────────────────────────────────────────────────

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files) {
    addFiles(Array.from(target.files));
  }
};

const handleDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (e.dataTransfer?.files) {
    addFiles(Array.from(e.dataTransfer.files));
  }
};

const addFiles = (newFiles: File[]) => {
  // Hanya ambil file pertama karena sistem telegram hanya dukung 1 foto
  if (newFiles.length > 0) {
    files.value = [newFiles[0]];
  }
};

const removeFile = (index: number) => {
  files.value.splice(index, 1);
};

const getFilePreview = (file: File) => {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  return null;
};

// ─── Submit ───────────────────────────────────────────────────────────────────

const handleSubmit = async () => {
  formError.value = '';

  const user = currentUser.value;
  if (!user) {
    formError.value = 'Sesi login tidak ditemukan. Silakan login ulang.';
    return;
  }
  if (!category.value) {
    formError.value = 'Mohon pilih kategori masalah.';
    return;
  }

  isLoading.value = true;
  formError.value = '';

  try {
    let attachmentBase64 = undefined;
    if (files.value.length > 0) {
      const file = files.value[0]; // Hanya ambil file pertama
      attachmentBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    }

    const id = await ticketStore.submitTicket({
      title: title.value.trim(),
      category: category.value as TicketCategory,
      priority: priority.value as TicketPriority,
      description: description.value.trim(),
      location: location.value.trim(),
      requesterNimNip: user.nimNip,
      requesterNama: user.nama,
      requesterEmail: `${user.nimNip}@student.uin-suska.ac.id`,
      requesterPhone: phone.value.trim() || undefined,
      attachmentBase64,
    });

    submittedId.value = id;
    submitted.value = true;
    clearFields();
  } catch (err) {
    formError.value = 'Gagal mengirim tiket ke server.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// ─── Reset ────────────────────────────────────────────────────────────────────

const clearFields = () => {
  title.value = '';
  category.value = '';
  priority.value = 'Medium';
  description.value = '';
  location.value = '';
  phone.value = '';
  files.value = [];
};

const handleReset = () => {
  submitted.value = false;
  submittedId.value = '';
  formError.value = '';
  clearFields();
};
</script>

<template>
<div class="max-w-4xl mx-auto space-y-6">
  <div>
    <h2 class="text-2xl font-bold text-slate-900">Buat Tiket Baru</h2>
    <p class="text-slate-600 mt-1">Isi formulir di bawah untuk mengajukan permintaan dukungan IT</p>
  </div>

  <!-- Success Dialog -->
  <Dialog v-model:open="submitted">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle2 class="h-6 w-6 text-green-600" />
        </div>
        <DialogTitle class="text-center text-xl">Tiket Berhasil Dibuat!</DialogTitle>
        <DialogDescription class="text-center text-base mt-2">
          Nomor tiket Anda: <strong class="text-green-700">{{ submittedId }}</strong>.
          <br/> Tim IT Helpdesk akan segera menangani permintaan Anda.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="sm:justify-center mt-4">
        <Button @click="submitted = false" variant="outline">Tutup</Button>
        <router-link to="/user/my-tickets">
          <Button class="bg-green-700 hover:bg-green-800">Lihat Daftar Tiket</Button>
        </router-link>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Error Dialog -->
  <Dialog :open="!!formError" @update:open="(val) => { if(!val) formError = '' }">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <AlertCircle class="h-6 w-6 text-red-600" />
        </div>
        <DialogTitle class="text-center text-xl text-red-700">Terjadi Kesalahan</DialogTitle>
        <DialogDescription class="text-center text-base mt-2 text-slate-700">
          {{ formError }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="sm:justify-center mt-4">
        <Button @click="formError = ''" variant="outline" class="border-red-200 text-red-700 hover:bg-red-50">Tutup</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Card>
    <CardHeader>
      <CardTitle>Formulir Pengajuan Tiket</CardTitle>
      <CardDescription>Lengkapi informasi berikut dengan detail</CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Title -->
        <div class="space-y-2">
          <Label for="title">Judul Masalah *</Label>
          <Input
            id="title"
            v-model="title"
            placeholder="Contoh: Tidak bisa akses jaringan WiFi kampus"
            required
            class="text-base border-slate-300 shadow-sm focus-visible:ring-green-500 focus-visible:border-green-500"
            :disabled="isLoading"
          />
          <p class="text-sm text-slate-500">Berikan judul yang jelas dan ringkas</p>
        </div>

        <!-- Category -->
        <div class="space-y-2">
          <Label>Kategori *</Label>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="cat in categoryOptions"
              :key="cat.value"
              type="button"
              @click="category = cat.value as TicketCategory"
              :class="[
                'flex flex-col items-center justify-center p-4 rounded-lg border transition-all',
                category === cat.value 
                  ? 'border-blue-300 bg-blue-50/50 text-blue-800 ring-1 ring-blue-300'
                  : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              ]"
            >
              <component :is="cat.icon" class="w-6 h-6 mb-2" :class="category === cat.value ? 'text-blue-600' : 'text-slate-500'" />
              <span class="text-sm font-medium">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- Priority -->
        <div class="space-y-2">
          <Label>Prioritas *</Label>
          <div class="flex p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
            <button
              v-for="pri in priorityOptions"
              :key="pri.value"
              type="button"
              @click="priority = pri.value as TicketPriority"
              :class="[
                'flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-all border',
                priority === pri.value ? pri.activeClass : 'border-transparent text-slate-600 hover:bg-slate-50 font-medium'
              ]"
            >
              <div :class="['w-3 h-1 rounded-full', pri.color]"></div>
              {{ pri.label }}
            </button>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <Label for="description">Deskripsi Masalah *</Label>
          <Textarea
            id="description"
            v-model="description"
            placeholder="Jelaskan masalah yang Anda alami secara detail..."
            required
            :rows="6"
            class="text-base resize-none border-slate-300 shadow-sm focus-visible:ring-green-500 focus-visible:border-green-500"
            :disabled="isLoading"
          />
          <p class="text-sm text-slate-500">
            Sertakan informasi seperti: kapan masalah terjadi, pesan error, langkah yang sudah dicoba
          </p>
        </div>

        <!-- Location -->
        <div class="space-y-2">
          <Label for="location">Lokasi *</Label>
          <Input
            id="location"
            v-model="location"
            placeholder="Contoh: Gedung Teknik Lt. 3 / Lab Komputer A"
            required
            class="text-base border-slate-300 shadow-sm focus-visible:ring-green-500 focus-visible:border-green-500"
            :disabled="isLoading"
          />
          <p class="text-sm text-slate-500">Lokasi dimana masalah terjadi</p>
        </div>

        <!-- File Upload -->
        <div class="space-y-2">
          <Label for="file">Lampiran Gambar (Maks 1 Gambar)</Label>
          <div 
            class="border-2 border-dashed rounded-lg p-6 text-center transition-colors relative"
            :class="isDragging ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-green-400 bg-slate-50/50'"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <input
              type="file"
              id="file"
              accept="image/*"
              @change="handleFileChange"
              class="hidden"
            />
            <label for="file" class="cursor-pointer block h-full w-full">
              <Upload class="w-8 h-8 text-slate-400 mx-auto mb-2" :class="{ 'text-green-500 animate-bounce': isDragging }" />
              <p class="text-sm font-medium text-slate-700">
                Klik untuk upload file atau drag &amp; drop
              </p>
              <p class="text-xs text-slate-500 mt-1">
                Format yang didukung: JPG, PNG (Maksimal 10MB)
              </p>
            </label>
          </div>

          <!-- File List / Preview -->
          <div v-if="files.length > 0" class="space-y-2 mt-3">
            <div
              v-for="(file, index) in files"
              :key="index"
              class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm"
            >
              <div class="flex items-center gap-3">
                <div v-if="getFilePreview(file)" class="w-12 h-12 rounded border bg-slate-100 overflow-hidden flex-shrink-0">
                  <img :src="getFilePreview(file) || ''" class="w-full h-full object-cover" alt="Preview" />
                </div>
                <div v-else class="w-12 h-12 rounded border bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <FileText class="w-6 h-6 text-green-700" />
                </div>
                
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-slate-700 truncate max-w-[200px] sm:max-w-xs">{{ file.name }}</span>
                  <span class="text-xs text-slate-500">
                    {{ (file.size / 1024).toFixed(1) }} KB
                  </span>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" @click="removeFile(index)" class="text-red-500 hover:text-red-700 hover:bg-red-50">
                <X class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="space-y-2">
          <Label for="phone">No. Telp (Opsional)</Label>
          <div class="flex">
            <div class="flex items-center justify-center px-3 border border-r-0 border-slate-300 rounded-l-md bg-slate-50 text-slate-500">
              <span class="text-sm">+62</span>
            </div>
            <Input
              id="phone"
              v-model="phone"
              type="tel"
              placeholder="081234567890"
              class="text-base rounded-l-none border-slate-300 shadow-sm focus-visible:ring-green-500 focus-visible:border-green-500"
              :disabled="isLoading"
            />
          </div>
          <p class="text-xs text-slate-500">Otomatis dari akun Anda</p>
        </div>

        <!-- Submit Buttons -->
        <div class="flex gap-3 pt-4 border-t border-slate-200">
          <Button
            type="submit"
            size="lg"
            class="bg-green-700 hover:bg-green-800 text-white font-medium shadow-md px-8 w-full sm:w-auto"
            :disabled="isLoading"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-5 w-5 animate-spin" />
            {{ isLoading ? 'Sedang Memproses...' : 'Kirim Masalah' }}
          </Button>
          <Button type="button" variant="outline" @click="handleReset" :disabled="isLoading">
            Batal
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>

  <!-- Help Card -->
  <Card class="bg-green-50 border-green-200">
    <CardContent class="pt-6">
      <div class="flex gap-4">
        <div class="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText class="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 class="font-medium text-slate-900 mb-1">Tips Mengisi Tiket</h4>
          <ul class="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>Berikan judul yang spesifik dan mudah dipahami</li>
            <li>Jelaskan masalah secara detail dan lengkap</li>
            <li>Upload screenshot atau foto jika diperlukan</li>
            <li>Sertakan informasi pesan error jika ada</li>
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
</template>
