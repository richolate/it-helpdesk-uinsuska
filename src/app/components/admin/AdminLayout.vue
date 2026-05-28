<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  Settings,
  User,
  LogOut,
  Menu,
  Bell,
  TrendingUp,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const currentUser = computed(() => auth.getCurrentUser());

import logoUinSuska from '@/assets/LOGO-LENGKAP.png';
import { useNotificationStore } from '@/stores/useNotificationStore';
import NotificationToast from '@/app/components/shared/NotificationToast.vue';
import { useTicketStore, formatDateShort } from '@/stores/useTicketStore';
import { onMounted, onUnmounted } from 'vue';

const notifStore = useNotificationStore();
const ticketStore = useTicketStore();

onMounted(() => ticketStore.startPolling());
onUnmounted(() => ticketStore.stopPolling());

const sidebarOpen = ref(true);
const notifDropdownOpen = ref(false);

const unreadCount = computed(() => notifStore.notifications.filter(n => !n.isRead).length);

const toggleNotifDropdown = () => {
  notifDropdownOpen.value = !notifDropdownOpen.value;
  if (notifDropdownOpen.value) {
    notifStore.markAllAsRead();
  }
};

const isActive = (path: string) => {
  if (path === "/admin" && route.path === "/admin") return true;
  if (path !== "/admin" && route.path.startsWith(path)) return true;
  return false;
};


const navItems = computed(() => [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/tickets", label: "Ticket Management", icon: Ticket, badge: ticketStore.adminStats.active },
  { path: "/admin/knowledge", label: "Knowledge Management", icon: BookOpen },
  { path: "/admin/performance", label: "Kinerja Pegawai", icon: TrendingUp },
  { path: "/admin/staff", label: "Kelola Pegawai", icon: User },
]);

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
<div class="h-screen overflow-hidden bg-slate-50 flex">
  <!-- Sidebar -->
  <aside
    :class="['bg-green-900 text-white flex flex-col transition-all duration-300 flex-shrink-0 h-full', sidebarOpen ? 'w-64' : 'w-20']"
  >
    <!-- Logo -->
    <div class="p-6 border-b border-green-800">
      <div class="flex items-center gap-3">
        <img
          :src="logoUinSuska"
          alt="UIN Suska Riau"
          class="w-10 h-10 object-contain flex-shrink-0 bg-white rounded-lg p-1"
        />
        <div v-if="sidebarOpen">
          <h1 class="text-lg font-bold">PTIPD Admin</h1>
          <p class="text-xs text-green-300">UIN Suska Riau</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-1">
      <router-link 
        v-for="item in navItems" 
        :key="item.path" 
        :to="item.path"
        v-slot="{ navigate }"
        custom
      >
        <button
          @click="navigate"
          :class="['w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors', isActive(item.path) ? 'bg-yellow-500 text-green-900' : 'text-green-100 hover:bg-green-800 hover:text-white']"
          :title="!sidebarOpen ? item.label : undefined"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <template v-if="sidebarOpen">
            <span class="flex-1 text-left">{{ item.label }}</span>
            <Badge v-if="item.badge" class="bg-red-500 text-white text-xs">
              {{ item.badge }}
            </Badge>
          </template>
        </button>
      </router-link>
    </nav>

    <!-- Settings -->
    <div class="p-4 border-t border-green-800">
      <router-link 
        to="/admin/settings"
        v-slot="{ navigate }"
        custom
      >
        <button
          @click="navigate"
          :class="['w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors', isActive('/admin/settings') ? 'bg-yellow-500 text-green-900' : 'text-green-100 hover:bg-green-800 hover:text-white']"
          :title="!sidebarOpen ? 'Settings' : undefined"
        >
          <Settings class="w-5 h-5 flex-shrink-0" />
          <span v-if="sidebarOpen" class="flex-1 text-left">Settings</span>
        </button>
      </router-link>
    </div>
  </aside>

  <!-- Main Content -->
  <div class="flex-1 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-green-200 sticky top-0 z-40 shadow-sm">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              @click="sidebarOpen = !sidebarOpen"
              class="text-green-700 hover:bg-green-50"
            >
              <Menu class="w-5 h-5" />
            </Button>
            <div>
              <h2 class="text-xl font-bold text-green-900">IT Service Management</h2>
              <p class="text-sm text-green-600">Admin Dashboard - PTIPD UIN Suska</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="relative">
              <Button @click="toggleNotifDropdown" variant="ghost" size="icon" class="relative text-green-700 hover:bg-green-50">
                <Bell class="w-5 h-5" />
                <Badge v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                  {{ unreadCount }}
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

            <Button @click="handleLogout" variant="ghost" size="icon" title="Logout" class="text-green-700 hover:bg-green-50">
              <LogOut class="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-1 p-6 overflow-auto">
      <div class="max-w-7xl mx-auto w-full">
        <router-view />
      </div>
    </main>
  </div>
  
  <!-- Logout Dialog -->
  <Dialog v-model:open="logoutDialogOpen">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold text-slate-900">Konfirmasi Keluar</DialogTitle>
        <DialogDescription>
          Apakah Anda yakin ingin keluar dari portal Admin IT?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-2 sm:gap-0 mt-4">
        <Button variant="outline" @click="logoutDialogOpen = false">Batal</Button>
        <Button variant="destructive" @click="confirmLogout">Ya, Keluar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  <NotificationToast />
</div>
</template>
