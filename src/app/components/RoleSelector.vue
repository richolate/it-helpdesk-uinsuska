<script setup lang="ts">
import { 
  GraduationCap, ShieldCheck, ArrowRight, 
  Wifi, BookOpen, UserCircle, MonitorSmartphone, AppWindow, HelpCircle,
  Globe, Mail, Share2 
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import logoUinSuska from '@/assets/LOGO-LENGKAP.png';
import bannerImage from '@/assets/banner_it_helpdesk.png';

const scrollToPortal = () => {
  const element = document.getElementById('portal-section');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    
    <!-- Navbar -->
    <nav class="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-3 shadow-sm grid grid-cols-3 items-center">
      <!-- Left: Logo -->
      <div class="flex justify-start">
        <img :src="logoUinSuska" alt="Logo UIN Suska" class="h-12 w-auto object-contain" />
      </div>
      
      <!-- Center: Text -->
      <div class="flex justify-center whitespace-nowrap">
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
          <span class="text-green-700">IT Helpdesk</span> UIN Suska Riau
        </h1>
      </div>

      <!-- Right: Login Button -->
      <div class="flex justify-end">
        <Button class="bg-green-700 hover:bg-green-800 text-white shadow-sm h-11 px-6 text-sm rounded-lg" @click="scrollToPortal">
          Login
        </Button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-6 md:px-10 md:py-8 space-y-10">
      
      <!-- Hero / Portal Selection Section -->
      <section id="portal-section" class="scroll-mt-24">
        <div class="grid md:grid-cols-12 gap-6">
          <!-- User Portal (Takes up more space, like 7 cols) -->
          <Card class="md:col-span-7 flex flex-col justify-between overflow-hidden relative group transition-all bg-white hover:-translate-y-1 hover:shadow-lg">
            <CardHeader class="p-8 md:p-10 relative z-10">
              <CardTitle class="text-3xl font-bold text-slate-900 mb-2">Portal Mahasiswa & Dosen</CardTitle>
              <CardDescription class="text-base text-slate-600 max-w-md leading-relaxed">
                Akses layanan bantuan teknis untuk kegiatan akademik, pengelolaan akun iRaise, dan dukungan infrastruktur digital kampus secara terintegrasi.
              </CardDescription>
            </CardHeader>
            <CardContent class="p-8 md:p-10 pt-0 relative z-10 mt-auto">
              <router-link to="/login/user">
                <Button class="bg-green-700 hover:bg-green-800 text-white rounded-lg px-6 py-6 h-auto text-base shadow-sm">
                  Masuk ke Portal
                  <ArrowRight class="ml-2 w-5 h-5" />
                </Button>
              </router-link>
            </CardContent>
            <!-- Decorative Icon -->
            <GraduationCap class="absolute -right-10 -bottom-10 w-64 h-64 text-slate-100 transform -rotate-12 group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
          </Card>

          <!-- Admin Portal (Takes up 5 cols) -->
          <Card class="md:col-span-5 flex flex-col bg-[#eaf6f4] transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardHeader class="p-8 md:p-10 pb-4">
              <div class="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mb-4 text-slate-700 shadow-sm">
                <ShieldCheck class="w-6 h-6" />
              </div>
              <CardTitle class="text-xl font-bold text-slate-900 mb-1">Dashboard Admin PTIPD</CardTitle>
              <CardDescription class="text-sm text-slate-600 leading-relaxed">
                Khusus staf teknis dan pengelola sistem informasi UIN Suska.
              </CardDescription>
            </CardHeader>
            <CardContent class="p-8 md:p-10 pt-0 mt-auto">
              <router-link to="/login/admin" class="inline-flex items-center text-sm font-semibold text-green-700 hover:text-slate-700 transition-colors">
                Kelola Sistem
                <ArrowRight class="ml-1 w-4 h-4" />
              </router-link>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Categories Section -->
      <section>
        <h2 class="text-2xl font-bold text-slate-900 mb-6">Kategori Bantuan</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Card class="transition-shadow hover:shadow-md">
            <CardContent class="p-6">
              <div class="w-10 h-10 bg-[#dce9ff] rounded-lg flex items-center justify-center text-[#13532c] mb-4">
                <Wifi class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-slate-900 mb-2">Jaringan</h3>
              <p class="text-sm text-slate-600 leading-relaxed">
                Solusi masalah koneksi Wi-Fi, LAN, Konfigurasi VPN, dan lain sebagainya terkait dengan Jaringan.
              </p>
            </CardContent>
          </Card>

          <Card class="transition-shadow hover:shadow-md">
            <CardContent class="p-6">
              <div class="w-10 h-10 bg-[#dce9ff] rounded-lg flex items-center justify-center text-[#13532c] mb-4">
                <BookOpen class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-slate-900 mb-2">iRaise</h3>
              <p class="text-sm text-slate-600 leading-relaxed">
                Bantuan teknis untuk akses dan kendala pada sistem akademik iRaise.
              </p>
            </CardContent>
          </Card>

          <Card class="transition-shadow hover:shadow-md">
            <CardContent class="p-6">
              <div class="w-10 h-10 bg-[#dce9ff] rounded-lg flex items-center justify-center text-[#13532c] mb-4">
                <UserCircle class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-slate-900 mb-2">Akun</h3>
              <p class="text-sm text-slate-600 leading-relaxed">
                Pemulihan password, aktivasi email institusi, dan SSO.
              </p>
            </CardContent>
          </Card>

          <Card class="transition-shadow hover:shadow-md">
            <CardContent class="p-6">
              <div class="w-10 h-10 bg-[#dce9ff] rounded-lg flex items-center justify-center text-[#13532c] mb-4">
                <MonitorSmartphone class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-slate-900 mb-2">Perangkat</h3>
              <p class="text-sm text-slate-600 leading-relaxed">
                Dukungan teknis untuk perangkat keras, komputer, dan periferal.
              </p>
            </CardContent>
          </Card>

          <Card class="transition-shadow hover:shadow-md">
            <CardContent class="p-6">
              <div class="w-10 h-10 bg-[#dce9ff] rounded-lg flex items-center justify-center text-[#13532c] mb-4">
                <AppWindow class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-slate-900 mb-2">Software</h3>
              <p class="text-sm text-slate-600 leading-relaxed">
                Akses dan lisensi Office 365, MATLAB, dan perangkat lunak lainnya.
              </p>
            </CardContent>
          </Card>

          <Card class="transition-shadow hover:shadow-md">
            <CardContent class="p-6">
              <div class="w-10 h-10 bg-[#dce9ff] rounded-lg flex items-center justify-center text-[#13532c] mb-4">
                <HelpCircle class="w-5 h-5" />
              </div>
              <h3 class="font-bold text-slate-900 mb-2">Lainnya</h3>
              <p class="text-sm text-slate-600 leading-relaxed">
                Bantuan untuk kendala IT umum yang tidak tercakup di atas.
              </p>
            </CardContent>
          </Card>

        </div>
      </section>

      <!-- Banner -->
      <section class="relative w-full rounded-2xl overflow-hidden shadow-md">
        <img :src="bannerImage" alt="Banner Background" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0 bg-green-900/80 mix-blend-multiply"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-green-900/90 to-transparent"></div>
        <div class="relative z-10 p-10 md:p-16 max-w-2xl">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Butuh Bantuan Cepat?</h2>
          <p class="text-lg text-green-50 leading-relaxed">
            Tim teknis kami siap membantu setiap kendala TI yang Anda alami 24/7 melalui sistem ticketing kami.
          </p>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 pt-12 pb-6 px-6 md:px-10 mt-auto">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <!-- Col 1 -->
          <div>
            <h4 class="font-bold text-slate-900 mb-4">UniHelp IT</h4>
            <p class="text-sm text-slate-600 leading-relaxed mb-4">
              Pusat Teknologi Informasi dan Pangkalan Data (PTIPD) UIN Sultan Syarif Kasim Riau.
            </p>
            <div class="flex gap-4 text-green-700">
              <Globe class="w-5 h-5 cursor-pointer hover:text-green-800" />
              <Mail class="w-5 h-5 cursor-pointer hover:text-green-800" />
              <Share2 class="w-5 h-5 cursor-pointer hover:text-green-800" />
            </div>
          </div>
          
          <!-- Col 2 -->
          <div>
            <h4 class="font-bold text-slate-900 mb-4">Jam Operasional</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li class="grid grid-cols-2"><span>Senin - Kamis:</span> <span>08.00 - 16.00</span></li>
              <li class="grid grid-cols-2"><span>Jum'at:</span> <span>08.00 - 16.30</span></li>
              <li class="grid grid-cols-2"><span>Sabtu - Minggu:</span> <span>Tutup</span></li>
            </ul>
          </div>

          <!-- Col 3 -->
          <div>
            <h4 class="font-bold text-slate-900 mb-4">Lokasi</h4>
            <p class="text-sm text-slate-600 leading-relaxed">
              Gedung PTIPD, Kampus II<br/>
              Jl. H.R. Soebrantas No. 155<br/>
              Pekanbaru, Riau
            </p>
          </div>

          <!-- Col 4 -->
          <div>
            <h4 class="font-bold text-slate-900 mb-4">Hubungi Kami</h4>
            <ul class="text-sm text-slate-600 space-y-2">
              <li><a href="mailto:contact.ptipd@uin-suska.ac.id" class="text-green-700 hover:underline">contact.ptipd@uin-suska.ac.id</a></li>
              <li>+628117627773</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Capstone Rising Star. All rights reserved.</p>
          <div class="flex gap-4">
            <a href="#" class="hover:text-slate-900">Privacy Policy</a>
            <a href="#" class="hover:text-slate-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>
