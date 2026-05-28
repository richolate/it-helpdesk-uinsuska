<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LayoutDashboard, Plus, ListChecks, BookOpen, Bell, User, LogOut } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/composables/useAuth";
import { useTicketStore } from "@/stores/useTicketStore";

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const ticketStore = useTicketStore();
const currentUser = computed(() => auth.getCurrentUser());

// Hitung notifikasi belum dibaca dari useNotificationStore
import { useNotificationStore } from '@/stores/useNotificationStore';
import NotificationToast from '@/app/components/shared/NotificationToast.vue';
import { formatDateShort } from '@/stores/useTicketStore';
import { onMounted, onUnmounted } from 'vue';

const notifStore = useNotificationStore();
const notifDropdownOpen = ref(false);

onMounted(() => ticketStore.startPolling());
onUnmounted(() => ticketStore.stopPolling());

const notifCount = computed(() => notifStore.notifications.filter(n => !n.isRead).length);

const toggleNotifDropdown = () => {
  notifDropdownOpen.value = !notifDropdownOpen.value;
  if (notifDropdownOpen.value) {
    notifStore.markAllAsRead();
  }
};

import logoUinSuska from '@/assets/LOGO-LENGKAP.png';

const isActive = (path: string) => {
  if (path === "/user" && route.path === "/user") return true;
  if (path !== "/user" && route.path.startsWith(path)) return true;
  return false;
};

const navItems = [
  { path: "/user", label: "Dashboard", icon: LayoutDashboard },
  { path: "/user/submit-ticket", label: "Buat Tiket", icon: Plus },
  { path: "/user/my-tickets", label: "Tiket Saya", icon: ListChecks },
  { path: "/user/knowledge-base", label: "Knowledge Base", icon: BookOpen },
];

const logoutDialogOpen = ref(false);

const handleLogout = () => {
  logoutDialogOpen.value = true;
};

const confirmLogout = () => {
  auth.logout();
  logoutDialogOpen.value = false;
  router.push("/");
};
</script>

<template>
<div class="min-h-screen bg-slate-50">
  <header class="bg-white border-b border-green-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <img
            :src="logoUinSuska"
            alt="UIN Suska Riau"
            class="w-12 h-12 object-contain"
          />
          <div class="border-l border-green-300 pl-4">
            <h1 class="text-xl font-bold text-green-800">IT Helpdesk Portal</h1>
            <p class="text-sm text-green-600">UIN Suska Riau - Portal Mahasiswa & Dosen</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="relative">
            <Button @click="toggleNotifDropdown" variant="ghost" size="icon" class="relative">
              <Bell class="w-5 h-5 text-green-700" />
              <Badge
                v-if="notifCount > 0"
                class="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
              >
                {{ notifCount > 9 ? '9+' : notifCount }}
              </Badge>
            </Button>
            
            <!-- Notifications Dropdown -->
            <div v-if="notifDropdownOpen" class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
              <div class="p-3 border-b bg-slate-50 flex justify-between items-center rounded-t-lg">
                <h3 class="font-semibold text-sm">Notifications</h3>
                <Badge variant="secondary" class="text-xs">{{ notifStore.notifications.length }}</Badge>
              </div>
              <div class="max-h-[300px] overflow-y-auto">
                <div v-if="notifStore.notifications.length === 0" class="p-6 text-center text-slate-500 text-sm">
                  Belum ada notifikasi
                </div>
                <div 
                  v-for="notif in notifStore.notifications" 
                  :key="notif.id"
                  class="p-3 border-b hover:bg-slate-50 cursor-default"
                >
                  <h4 class="text-sm font-medium text-slate-900">{{ notif.title }}</h4>
                  <p class="text-xs text-slate-600 mt-1 line-clamp-2">{{ notif.message }}</p>
                  <p class="text-[10px] text-slate-400 mt-2">{{ formatDateShort(notif.time.toISOString()) }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 pl-4 border-l border-green-200">
            <div class="text-right">
              <p class="text-sm font-medium text-green-900">{{ currentUser?.nama ?? '-' }}</p>
              <p class="text-xs text-green-600">{{ currentUser?.role ?? '-' }}</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User class="w-5 h-5 text-green-700" />
            </div>
          </div>

          <Button @click="handleLogout" variant="ghost" size="icon" title="Logout">
            <LogOut class="w-5 h-5 text-green-700" />
          </Button>
        </div>
      </div>

      <nav class="flex gap-1 mt-4 -mb-px">
        <router-link 
          v-for="item in navItems" 
          :key="item.path" 
          :to="item.path"
          v-slot="{ navigate }"
          custom
        >
          <button
            @click="navigate"
            :class="[
              'flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-colors',
              isActive(item.path)
                ? 'bg-green-50 text-green-800 border-b-2 border-green-600'
                : 'text-green-700 hover:text-green-900 hover:bg-green-50/50'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            {{ item.label }}
          </button>
        </router-link>
      </nav>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-8">
    <router-view />
  </main>
  <NotificationToast />

  <!-- Logout Dialog -->
  <Dialog v-model:open="logoutDialogOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold text-slate-900">Konfirmasi Keluar</DialogTitle>
        <DialogDescription>
          Apakah Anda yakin ingin keluar dari portal ini?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-2 sm:gap-0 mt-4">
        <Button variant="outline" @click="logoutDialogOpen = false">Batal</Button>
        <Button variant="destructive" @click="confirmLogout">Ya, Keluar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
</template>
