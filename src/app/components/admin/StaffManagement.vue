<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Copy, CheckCircle2, User, Phone, Briefcase, Network, Monitor, MonitorPlay, MoreHorizontal } from "lucide-vue-next";
import { useNotificationStore } from "@/stores/useNotificationStore";

// State
const staffList = ref<any[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);

// Delete state
const isDeleteModalOpen = ref(false);
const staffToDelete = ref<any>(null);

// Form
const currentView = ref<'list'|'add'>('list');
const notifStore = useNotificationStore();
const nimNip = ref('');
const name = ref('');
const email = ref('');
const role = ref('');
const specialty = ref('');
const phone = ref('');

// Success Dialog
const successModalOpen = ref(false);
const generatedRegCode = ref('');

const fetchStaff = async () => {
  isLoading.value = true;
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/users');
    const data = await res.json();
    staffList.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const openDeleteConfirm = (staff: any) => {
  staffToDelete.value = staff;
  isDeleteModalOpen.value = true;
};

const confirmDeleteStaff = async () => {
  if (!staffToDelete.value) return;
  isDeleting.value = true;
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/api/users/${staffToDelete.value.id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      isDeleteModalOpen.value = false;
      notifStore.addNotification({
        title: 'Pegawai Berhasil Dihapus',
        message: `Pegawai ${staffToDelete.value.name} telah dihapus dari sistem.`,
        type: 'success'
      });
      staffToDelete.value = null;
      fetchStaff();
    } else {
      notifStore.addNotification({
        title: 'Gagal Menghapus Pegawai',
        message: data.error || 'Terjadi kesalahan.',
        type: 'error'
      });
    }
  } catch (e) {
    console.error(e);
    notifStore.addNotification({
      title: 'Terjadi Kesalahan',
      message: 'Koneksi ke server gagal.',
      type: 'error'
    });
  } finally {
    isDeleting.value = false;
  }
};

const handleAddStaff = async () => {
  isSubmitting.value = true;
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nimNip: nimNip.value,
        name: name.value,
        email: email.value,
        passwordHash: 'teknisi123', // Default dummy password
        role: role.value,
        specialty: role.value === 'Teknisi' ? specialty.value : undefined,
        phone: phone.value
      })
    });
    
    const data = await res.json();
    if (data.success) {
      currentView.value = 'list';
      if (data.telegramRegCode) {
        generatedRegCode.value = data.telegramRegCode;
        successModalOpen.value = true;
      } else {
        notifStore.addNotification({
          title: 'Pegawai Berhasil Ditambahkan',
          message: `Pegawai ${name.value} (${nimNip.value}) telah didaftarkan ke sistem.`,
          type: 'success'
        });
      }
      fetchStaff(); // refresh
      // Reset form
      nimNip.value = ''; name.value = ''; email.value = ''; role.value = ''; specialty.value = ''; phone.value = '';
    } else {
      notifStore.addNotification({
        title: 'Gagal Menambahkan Pegawai',
        message: data.error || 'Terjadi kesalahan pada server.',
        type: 'error'
      });
    }
  } catch (e) {
    console.error(e);
    notifStore.addNotification({
      title: 'Koneksi Gagal',
      message: 'Gagal menghubungi server backend.',
      type: 'error'
    });
  } finally {
    isSubmitting.value = false;
  }
};

const copyToClipboard = () => {
  navigator.clipboard.writeText('/daftar ' + generatedRegCode.value);
  alert('Kode berhasil disalin!');
};

onMounted(() => {
  fetchStaff();
});
</script>

<template>
<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">{{ currentView === 'list' ? 'Kelola Pegawai' : 'Tambah Pegawai Baru' }}</h2>
      <p class="text-slate-600 mt-1">{{ currentView === 'list' ? 'Manajemen data admin dan teknisi IT' : 'Lengkapi informasi di bawah ini untuk mendaftarkan staf baru ke dalam sistem SereneSupport.' }}</p>
    </div>
    <Button v-if="currentView === 'list'" @click="currentView = 'add'" class="bg-green-700 hover:bg-green-800 text-white rounded-full">
      <UserPlus class="w-4 h-4 mr-2" />
      Tambah Pegawai
    </Button>
  </div>

  <div v-if="currentView === 'list'">
  <Card>
    <CardContent class="p-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow class="bg-slate-50">
            <TableHead>NIP / ID</TableHead>
            <TableHead>Nama Pegawai</TableHead>
            <TableHead>Peran</TableHead>
            <TableHead>Spesialisasi</TableHead>
            <TableHead>Kontak</TableHead>
            <TableHead>Status Telegram</TableHead>
            <TableHead class="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="7" class="text-center py-8 text-slate-500">Memuat data pegawai...</TableCell>
          </TableRow>
          <TableRow v-else-if="staffList.length === 0">
            <TableCell colspan="7" class="text-center py-8 text-slate-500">Belum ada pegawai terdaftar.</TableCell>
          </TableRow>
          <TableRow v-for="staff in staffList" :key="staff.id">
            <TableCell class="font-medium">{{ staff.nimNip }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <User class="w-4 h-4" />
                </div>
                <div>
                  <p class="font-medium text-slate-900">{{ staff.name }}</p>
                  <p class="text-xs text-slate-500">{{ staff.email }}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="staff.role === 'Admin IT' ? 'default' : 'secondary'">
                {{ staff.role }}
              </Badge>
            </TableCell>
            <TableCell>
              <span class="text-slate-600 text-sm">{{ staff.specialty || '-' }}</span>
            </TableCell>
            <TableCell>
              <div class="flex items-center gap-1 text-slate-600 text-sm">
                <Phone class="w-3 h-3" />
                {{ staff.phone || '-' }}
              </div>
            </TableCell>
            <TableCell>
              <div v-if="staff.role === 'Teknisi'">
                <Badge v-if="staff.telegramChatId" class="bg-green-100 text-green-700 border-green-200">
                  Terhubung
                </Badge>
                <div v-else class="flex flex-col gap-1">
                  <Badge class="bg-slate-100 text-slate-600 border-slate-200 w-fit">
                    Belum Terhubung
                  </Badge>
                  <span class="text-xs text-blue-600 font-mono cursor-help" title="Kode Registrasi Telegram">
                    /daftar {{ staff.telegramRegCode }}
                  </span>
                </div>
              </div>
              <div v-else>
                <span class="text-xs text-slate-400">-</span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="sm" class="text-red-600 hover:text-red-700 hover:bg-red-50" @click="openDeleteConfirm(staff)">
                Hapus
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
  </div>

  <!-- Add Staff Form -->
  <Card v-else-if="currentView === 'add'">
    <CardContent class="p-6">
      <form @submit.prevent="handleAddStaff" class="space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label class="text-slate-700 font-medium">NIP / ID Pegawai</Label>
            <Input v-model="nimNip" required placeholder="Contoh: IT-2023-001" class="h-11" />
          </div>
          <div class="space-y-2">
            <Label class="text-slate-700 font-medium">Nama Lengkap</Label>
            <Input v-model="name" required placeholder="Masukkan nama lengkap" class="h-11" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <Label class="text-slate-700 font-medium">Email Perusahaan</Label>
            <Input v-model="email" type="email" required placeholder="nama.pegawai@perusahaan.com" class="h-11" />
          </div>
          <div class="space-y-2">
            <Label class="text-slate-700 font-medium">No. Handphone</Label>
            <div class="relative">
              <Phone class="w-5 h-5 absolute left-3 top-3 text-slate-400" />
              <Input v-model="phone" required placeholder="0812xxxx" class="h-11 pl-10" />
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <Label class="text-slate-700 font-medium">Pilih Peran (Role)</Label>
          <div class="grid grid-cols-2 gap-4">
            <div 
              @click="role = 'Admin IT'"
              :class="['border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4', role === 'Admin IT' ? 'border-green-600 bg-green-50/50' : 'border-slate-200 hover:border-slate-300']"
            >
              <div class="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                <Briefcase class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 text-lg">Admin IT</h4>
                <p class="text-slate-500 text-sm">Manajemen hak akses & sistem</p>
              </div>
              <div v-if="role === 'Admin IT'" class="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center">
                <CheckCircle2 class="w-4 h-4" />
              </div>
            </div>
            
            <div 
              @click="role = 'Teknisi'"
              :class="['border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4', role === 'Teknisi' ? 'border-green-600 bg-green-50/50' : 'border-slate-200 hover:border-slate-300']"
            >
              <div class="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                <User class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-slate-900 text-lg">Teknisi</h4>
                <p class="text-slate-500 text-sm">Penanganan insiden teknis</p>
              </div>
              <div v-if="role === 'Teknisi'" class="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center">
                <CheckCircle2 class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="role === 'Teknisi'" class="space-y-3 pt-4 border-t border-slate-100">
          <Label class="text-slate-700 font-medium">Spesialisasi Teknisi</Label>
          <div class="grid grid-cols-4 gap-4">
            <div 
              v-for="spec in ['Jaringan', 'Hardware', 'Software', 'Lainnya']" :key="spec"
              @click="specialty = spec"
              :class="['border-2 rounded-xl p-4 cursor-pointer text-center transition-all', specialty === spec ? 'border-green-600 bg-green-50/50 text-green-700' : 'border-slate-200 hover:border-slate-300 text-slate-600']"
            >
              <div class="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-2" :class="specialty === spec ? 'bg-green-100 text-green-700' : ''">
                <Network v-if="spec === 'Jaringan'" class="w-5 h-5" />
                <Monitor v-else-if="spec === 'Hardware'" class="w-5 h-5" />
                <MonitorPlay v-else-if="spec === 'Software'" class="w-5 h-5" />
                <MoreHorizontal v-else class="w-5 h-5" />
              </div>
              <p class="font-medium text-sm">{{ spec }}</p>
            </div>
          </div>
        </div>

        <div class="pt-6 flex items-center justify-end gap-3 mt-6">
          <Button type="button" variant="outline" @click="currentView = 'list'" class="rounded-full px-6 text-slate-600 border-slate-300">Batal</Button>
          <Button type="submit" class="bg-green-700 hover:bg-green-800 text-white rounded-full px-6" :disabled="isSubmitting">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Pegawai' }}
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>

  <!-- Telegram Code Success Modal -->
  <Dialog v-model:open="successModalOpen">
    <DialogContent class="sm:max-w-md text-center">
      <DialogHeader>
        <div class="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 class="w-6 h-6 text-green-600" />
        </div>
        <DialogTitle class="text-xl">Pegawai Berhasil Ditambahkan!</DialogTitle>
        <DialogDescription class="pt-2">
          Teknisi baru membutuhkan *binding* akun Telegram agar bisa menerima notifikasi tiket. Silakan berikan kode berikut ke teknisi tersebut.
        </DialogDescription>
      </DialogHeader>
      
      <div class="bg-slate-50 p-6 rounded-lg border border-slate-200 my-4 space-y-3">
        <p class="text-sm font-medium text-slate-700">Langkah untuk Teknisi:</p>
        <ol class="text-sm text-slate-600 text-left list-decimal list-inside space-y-1">
          <li>Buka aplikasi Telegram</li>
          <li>Masuk ke Grup IT Helpdesk atau Chat Bot</li>
          <li>Ketik perintah di bawah ini dan kirim:</li>
        </ol>
        <div class="flex items-center justify-between bg-white border border-slate-300 rounded p-2 mt-2">
          <code class="text-blue-700 font-mono text-sm px-2">/daftar {{ generatedRegCode }}</code>
          <Button variant="ghost" size="sm" @click="copyToClipboard" class="h-8 w-8 p-0">
            <Copy class="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      <DialogFooter class="sm:justify-center">
        <Button @click="successModalOpen = false" class="bg-green-700 hover:bg-green-800 text-white px-8 rounded-full">Selesai</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Delete Confirmation Modal -->
  <Dialog v-model:open="isDeleteModalOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="text-red-600 flex items-center gap-2">
          Peringatan Penghapusan
        </DialogTitle>
        <DialogDescription class="pt-2 text-slate-700">
          Apakah Anda yakin ingin menghapus <strong>{{ staffToDelete?.name }}</strong> dari sistem?
        </DialogDescription>
      </DialogHeader>
      
      <div class="bg-red-50 text-red-800 text-sm p-4 rounded-lg border border-red-200 my-2">
        <strong>Disclaimer:</strong>
        <ul class="list-disc list-inside mt-2 space-y-1">
          <li>Pegawai tidak akan bisa lagi login atau mengakses sistem.</li>
          <li>Tiket yang sebelumnya ditugaskan ke pegawai ini akan kehilangan nama assigneenya (Namun data historis tiket tetap aman).</li>
          <li>Akses Bot Telegram untuk teknisi ini akan langsung terputus.</li>
        </ul>
      </div>

      <DialogFooter class="pt-4">
        <Button variant="outline" @click="isDeleteModalOpen = false">Batal</Button>
        <Button variant="destructive" @click="confirmDeleteStaff" :disabled="isDeleting">
          {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
</template>
