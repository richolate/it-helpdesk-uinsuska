<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, AlertCircle, ArrowLeft, Users, Shield } from "lucide-vue-next";

import logoUinSuska from '@/assets/LOGO-LENGKAP.png';

const router = useRouter();
const route = useRoute();
const auth = useAuth();

const roleType = computed(() => route.params.roleType as string);

const showPassword = ref(false);
const nimNip = ref("");
const password = ref("");
const error = ref("");
const isLoading = ref(false);

const isUserRole = computed(() => roleType.value === "user");
const roleConfig = computed(() => ({
  title: isUserRole.value ? "Portal Mahasiswa & Dosen" : "Dashboard Admin PTIPD",
  icon: isUserRole.value ? Users : Shield,
  redirectPath: isUserRole.value ? "/user" : "/admin",
}));

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  error.value = "";

  if (!nimNip.value || !password.value) {
    error.value = "NIM/NIP dan Password harus diisi";
    return;
  }

  isLoading.value = true;

  // Simulasi delay jaringan
  setTimeout(() => {
    const account = auth.login(nimNip.value, password.value, roleType.value as "user" | "admin");

    if (account) {
      router.push(roleConfig.value.redirectPath);
    } else {
      error.value = "NIM/NIP atau Password salah, atau Anda tidak memiliki akses ke portal ini.";
    }

    isLoading.value = false;
  }, 800);
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-8">
    <div class="max-w-md w-full">
      <!-- Back Button -->
      <router-link to="/">
        <Button variant="ghost" class="mb-4 text-green-700 hover:text-green-800 hover:bg-green-50">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Kembali ke Pilihan Role
        </Button>
      </router-link>

      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center mb-6">
          <img
            :src="logoUinSuska"
            alt="UIN Suska Riau"
            class="w-24 h-24 object-contain"
          />
        </div>
        <h1 class="text-3xl font-bold text-green-900 mb-2">IT Helpdesk Portal</h1>
        <p class="text-green-700">Universitas Islam Negeri Sultan Syarif Kasim Riau</p>
      </div>

      <!-- Login Card -->
      <Card class="border-2 border-green-200 shadow-lg">
        <CardHeader class="text-center">
          <div class="flex items-center justify-center gap-2 mb-2">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center', isUserRole ? 'bg-green-100' : 'bg-yellow-100']">
              <component :is="roleConfig.icon" :class="['w-5 h-5', isUserRole ? 'text-green-700' : 'text-yellow-700']" />
            </div>
          </div>
          <CardTitle class="text-2xl text-green-900">{{ roleConfig.title }}</CardTitle>
          <CardDescription>
            Masuk menggunakan akun SSO UIN Suska Riau
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit="handleSubmit" class="space-y-5">
            <!-- Error Alert -->
            <Alert v-if="error" class="border-red-200 bg-red-50">
              <AlertCircle class="h-4 w-4 text-red-600" />
              <AlertDescription class="text-red-800">
                {{ error }}
              </AlertDescription>
            </Alert>

            <!-- NIM/NIP Field -->
            <div class="space-y-2">
              <Label htmlFor="nimNip">NIM / NIP</Label>
              <Input
                id="nimNip"
                type="text"
                placeholder="Masukkan NIM atau NIP"
                v-model="nimNip"
                class="h-11 border-green-200 focus:border-green-500"
                :disabled="isLoading"
              />
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div class="relative">
                <Input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan password"
                  v-model="password"
                  class="h-11 pr-10 border-green-200 focus:border-green-500"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  :disabled="isLoading"
                >
                  <EyeOff v-if="showPassword" class="w-5 h-5" />
                  <Eye v-else class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-green-300 text-green-700 focus:ring-green-500"
                />
                <span class="text-slate-600">Ingat saya</span>
              </label>
              <a href="#" class="text-green-700 hover:text-green-800 hover:underline">
                Lupa password?
              </a>
            </div>

            <!-- Submit Button -->
            <Button
              type="submit"
              class="w-full h-11 bg-green-700 hover:bg-green-800 text-white"
              :disabled="isLoading"
            >
              <template v-if="isLoading">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Memproses...
              </template>
              <template v-else>
                <LogIn class="w-4 h-4 mr-2" />
                Masuk
              </template>
            </Button>
          </form>

          <!-- Additional Info -->
          <div class="mt-6 pt-6 border-t border-slate-200">
            <p class="text-sm text-center text-slate-600">
              Belum punya akun SSO? 
              <a href="#" class="text-green-700 hover:text-green-800 font-medium hover:underline">
                Hubungi admin IT
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Help Text -->
      <div class="mt-6 text-center">
        <p class="text-sm text-slate-600">
          Gunakan akun SSO yang sama dengan akun iRaise dan portal akademik
        </p>
      </div>
    </div>
  </div>
</template>
