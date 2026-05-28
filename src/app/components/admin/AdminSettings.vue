<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/composables/useAuth";
import { Save, User, Mail, Shield, Phone, Briefcase, Activity, Clock, CheckCircle2, Star } from "lucide-vue-next";

const auth = useAuth();
const currentUser = computed(() => auth.getCurrentUser());

const name = ref(currentUser.value?.nama || '');
const email = ref(currentUser.value?.email || '');
const phone = ref('081234567890'); // Dummy data for phone
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const isSaving = ref(false);
const saveSuccess = ref(false);

const adminStats = ref<any>(null);

onMounted(async () => {
  try {
    const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/performance');
    const data = await res.json();
    const myStats = data.adminPerformance.find((a: any) => a.name === currentUser.value?.nama);
    if (myStats) {
      adminStats.value = myStats;
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
});

const handleSaveProfile = () => {
  isSaving.value = true;
  setTimeout(() => {
    isSaving.value = false;
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  }, 1000);
};
</script>

<template>
<div class="space-y-6 max-w-5xl mx-auto">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Pengaturan Akun</h2>
      <p class="text-slate-600 mt-1">Kelola informasi profil dan keamanan akun Anda</p>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    
    <!-- Profil Singkat & Performa -->
    <div class="space-y-6 md:col-span-1">
      <Card class="border-t-4 border-t-green-600">
        <CardContent class="pt-6 flex flex-col items-center text-center">
          <div class="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center mb-4">
            <User class="w-12 h-12 text-slate-400" />
          </div>
          <h3 class="text-xl font-bold text-slate-900">{{ currentUser?.nama }}</h3>
          <p class="text-slate-500 mb-3">{{ currentUser?.nimNip }}</p>
          <Badge class="bg-blue-100 text-blue-700 border-blue-200 px-4 py-1 text-sm font-medium">{{ currentUser?.role }}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-lg flex items-center gap-2">
            <Activity class="w-5 h-5 text-green-600" /> Ringkasan Performa
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="adminStats">
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500 flex items-center gap-2"><Briefcase class="w-4 h-4"/> Tiket Handled</span>
              <span class="font-bold text-slate-900">{{ adminStats.ticketsHandled }}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500 flex items-center gap-2"><Clock class="w-4 h-4"/> Avg Response</span>
              <span class="font-bold text-slate-900">{{ adminStats.avgResponseTime }}m</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500 flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-green-500"/> SLA</span>
              <span class="font-bold text-green-600">{{ adminStats.slaCompliance }}</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-slate-500 flex items-center gap-2"><Star class="w-4 h-4 text-yellow-500"/> Rating</span>
              <Badge variant="outline" class="border-yellow-300 text-yellow-700 bg-yellow-50">{{ adminStats.rating }}</Badge>
            </div>
          </div>
          <div v-else class="text-center py-4 text-slate-500 text-sm">
            Memuat data performa...
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Edit Profil Form -->
    <div class="md:col-span-2 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
          <CardDescription>Perbarui nama dan kontak Anda di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSaveProfile" class="space-y-5">
            <div class="grid grid-cols-2 gap-5">
              <div class="space-y-2">
                <Label>Nama Lengkap</Label>
                <div class="relative">
                  <User class="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input v-model="name" class="pl-9" />
                </div>
              </div>
              <div class="space-y-2">
                <Label>NIP / ID</Label>
                <div class="relative">
                  <Shield class="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input :value="currentUser?.nimNip" disabled class="pl-9 bg-slate-50 text-slate-500" />
                </div>
                <p class="text-xs text-slate-400">NIP tidak dapat diubah.</p>
              </div>
              <div class="space-y-2">
                <Label>Email</Label>
                <div class="relative">
                  <Mail class="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input v-model="email" type="email" class="pl-9" />
                </div>
              </div>
              <div class="space-y-2">
                <Label>No. Handphone</Label>
                <div class="relative">
                  <Phone class="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input v-model="phone" class="pl-9" />
                </div>
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <Button type="submit" class="bg-green-700 hover:bg-green-800 w-40" :disabled="isSaving">
                <Save v-if="!isSaving" class="w-4 h-4 mr-2" />
                {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </Button>
            </div>
            
            <div v-if="saveSuccess" class="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
              <CheckCircle2 class="w-5 h-5" /> Profil berhasil diperbarui!
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keamanan</CardTitle>
          <CardDescription>Ganti kata sandi akun Anda secara berkala untuk menjaga keamanan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4 max-w-md">
            <div class="space-y-2">
              <Label>Kata Sandi Saat Ini</Label>
              <Input type="password" v-model="currentPassword" placeholder="Masukkan kata sandi lama" />
            </div>
            <div class="space-y-2">
              <Label>Kata Sandi Baru</Label>
              <Input type="password" v-model="newPassword" placeholder="Buat kata sandi baru" />
            </div>
            <div class="space-y-2">
              <Label>Konfirmasi Kata Sandi</Label>
              <Input type="password" v-model="confirmPassword" placeholder="Ulangi kata sandi baru" />
            </div>
            <div class="pt-2">
              <Button type="button" variant="outline" class="border-green-700 text-green-700 hover:bg-green-50">
                Ganti Kata Sandi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
</template>
