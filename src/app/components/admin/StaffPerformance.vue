<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Download,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  Award,
  FileText,
  Activity
} from "lucide-vue-next";

import {
  Chart as ChartJS,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend);

const selectedPeriod = ref("month");
const selectedDate = ref("2026-04-18");
const selectedStaff = ref("all");

// Data State
const adminPerformance = ref<any[]>([]);
const technicianPerformance = ref<any[]>([]);
const dailyLogs = ref<any[]>([]);
const isLoading = ref(true);

const fetchPerformanceData = async () => {
  isLoading.value = true;
  try {
    const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/performance');
    const data = await response.json();
    adminPerformance.value = data.adminPerformance;
    technicianPerformance.value = data.technicianPerformance;
    dailyLogs.value = data.dailyLogs;
    
    if (dailyLogs.value.length > 0 && selectedDate.value === "2026-04-18") {
      selectedDate.value = dailyLogs.value[0].date;
    }
  } catch (error) {
    console.error('Failed to fetch performance data:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchPerformanceData();
});

// Dynamic Summary Calculations
const totalStaff = computed(() => adminPerformance.value.length + technicianPerformance.value.length);
const totalResolvedTickets = computed(() => {
  return technicianPerformance.value.reduce((acc, curr) => acc + curr.completedTickets, 0);
});
const totalTicketsHandled = computed(() => {
  // Handled could include in-progress, but here we'll map it to completed + anything assigned if we had it, but we only have completedTickets in tech performance. Or we can use admin handled + tech handled.
  return adminPerformance.value.reduce((acc, curr) => acc + curr.ticketsHandled, 0) + technicianPerformance.value.reduce((acc, curr) => acc + curr.assignedTickets, 0);
});
const avgSlaCompliance = computed(() => {
  const techSla = technicianPerformance.value.map(t => t.slaCompliance);
  if (techSla.length === 0) return 100;
  return Math.round(techSla.reduce((a, b) => a + b, 0) / techSla.length);
});
const avgResponseTime = computed(() => {
  const techAvgs = technicianPerformance.value.map(t => parseFloat(t.avgCompletionTime) || 0);
  if (techAvgs.length === 0) return "0h";
  return (techAvgs.reduce((a, b) => a + b, 0) / techAvgs.length).toFixed(1) + "h";
});

// Chart data
const performanceChartData = computed(() => {
  return technicianPerformance.value.map(t => {
    const tepatWaktu = Math.round((t.slaCompliance / 100) * t.completedTickets);
    const terlambat = t.completedTickets - tepatWaktu;
    return { name: t.name, tepatWaktu, terlambat };
  });
});

const barChartData = computed(() => ({
  labels: performanceChartData.value.map(d => d.name.split(' ')[0]),
  datasets: [
    { label: 'Selesai Tepat Waktu', backgroundColor: '#2E7D32', data: performanceChartData.value.map(d => d.tepatWaktu) },
    { label: 'Terlambat (Miss SLA)', backgroundColor: '#EF4444', data: performanceChartData.value.map(d => d.terlambat) },
  ]
}));

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1500,
    easing: 'easeOutQuart',
    y: {
      from: 500
    }
  },
  scales: {
    x: { stacked: true },
    y: { stacked: true, beginAtZero: true }
  }
};

const staffList = computed(() => {
  const list = [
    { value: "all", label: "Semua Staff" },
    { value: "role-admin", label: "Semua Admin" },
    { value: "role-teknisi", label: "Semua Teknisi" }
  ];
  adminPerformance.value.forEach(a => list.push({ value: a.name, label: `${a.name} (Admin)` }));
  technicianPerformance.value.forEach(t => list.push({ value: t.name, label: `${t.name} (Teknisi)` }));
  return list;
});

const filteredDailyLogs = computed(() => {
  return dailyLogs.value.filter(
    (log) => {
      if (log.date !== selectedDate.value) return false;
      if (selectedStaff.value === "all") return true;
      if (selectedStaff.value === "role-admin") return log.role === "Admin IT";
      if (selectedStaff.value === "role-teknisi") return log.role === "Teknisi";
      return log.staffName === selectedStaff.value;
    }
  );
});

const handleExportReport = () => {
  console.log("Exporting performance report...");
  alert("Laporan kinerja akan didownload dalam format CSV");
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case "Excellent":
      return "bg-green-100 text-green-800 border-green-300";
    case "Very Good":
      return "bg-green-50 text-green-700 border-green-200";
    case "Good":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};
</script>

<template>
<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Kinerja Pegawai</h2>
      <p class="text-slate-600 mt-1">Monitor performa admin dan teknisi IT</p>
    </div>
    <div class="flex items-center gap-3">
      <Select v-model="selectedPeriod">
        <SelectTrigger class="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">Minggu Ini</SelectItem>
          <SelectItem value="month">Bulan Ini</SelectItem>
          <SelectItem value="quarter">Kuartal Ini</SelectItem>
          <SelectItem value="year">Tahun Ini</SelectItem>
        </SelectContent>
      </Select>
      <Button @click="handleExportReport" class="bg-green-700 hover:bg-green-800">
        <Download class="w-4 h-4 mr-2" />
        Export Laporan
      </Button>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <template v-if="isLoading">
      <Card v-for="i in 4" :key="i">
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <div class="h-4 w-32 bg-slate-200 animate-pulse rounded"></div>
              <div class="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
            </div>
            <div class="w-12 h-12 bg-slate-200 animate-pulse rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    </template>
    <template v-else>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 mb-1">Total Tiket Selesai</p>
              <p class="text-3xl font-bold text-slate-900">{{ totalResolvedTickets }}</p>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg">
              <CheckCircle2 class="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 mb-1">Avg SLA Compliance</p>
              <p class="text-3xl font-bold text-green-700">{{ avgSlaCompliance }}%</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <CheckCircle2 class="w-6 h-6 text-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 mb-1">Total Tiket Handled</p>
              <p class="text-3xl font-bold text-slate-900">{{ totalTicketsHandled }}</p>
            </div>
            <div class="bg-yellow-50 p-3 rounded-lg">
              <TrendingUp class="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 mb-1">Avg Completion Time</p>
              <p class="text-3xl font-bold text-slate-900">{{ avgResponseTime }}</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <Clock class="w-6 h-6 text-green-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>

  <!-- Performance Chart -->
  <Card v-if="isLoading">
    <CardHeader>
      <CardTitle>Grafik Perbandingan Kinerja Teknisi</CardTitle>
      <CardDescription>Performa penyelesaian tiket tepat waktu vs terlambat</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="w-full h-[300px] bg-slate-100 animate-pulse rounded-xl"></div>
    </CardContent>
  </Card>
  <Card v-else-if="performanceChartData.length > 0">
    <CardHeader>
      <CardTitle>Grafik Perbandingan Kinerja Teknisi</CardTitle>
      <CardDescription>Performa penyelesaian tiket tepat waktu vs terlambat</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="w-full h-[300px]">
        <Bar :key="performanceChartData.length" :data="barChartData" :options="barChartOptions" />
      </div>
    </CardContent>
  </Card>

  <!-- Detailed Performance Tables -->
  <Tabs defaultValue="admin" class="w-full">
    <TabsList class="grid w-full max-w-3xl grid-cols-3">
      <TabsTrigger value="admin">Admin Performance</TabsTrigger>
      <TabsTrigger value="technician">Teknisi Performance</TabsTrigger>
      <TabsTrigger value="daily">Log Harian</TabsTrigger>
    </TabsList>

    <!-- Admin Performance Tab -->
    <TabsContent value="admin" class="mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Kinerja Admin IT</CardTitle>
          <CardDescription>
            Performa admin dalam mengelola tiket dan aktivitas sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow class="bg-slate-50">
                  <TableHead class="font-semibold">Nama</TableHead>
                  <TableHead class="font-semibold">Role</TableHead>
                  <TableHead class="font-semibold">Tiket Handled</TableHead>
                  <TableHead class="font-semibold">Avg Response</TableHead>
                  <TableHead class="font-semibold">Avg Resolution</TableHead>
                  <TableHead class="font-semibold">SLA Compliance</TableHead>
                  <TableHead class="font-semibold">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="admin in adminPerformance" :key="admin.id" class="hover:bg-slate-50">
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User class="w-4 h-4 text-green-700" />
                      </div>
                      <span class="font-medium">{{ admin.name }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" class="bg-green-50 text-green-700 border-green-200">
                      {{ admin.role }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-center">
                    <span class="font-semibold text-slate-900">{{ admin.ticketsHandled }}</span>
                  </TableCell>
                  <TableCell>{{ admin.avgResponseTime }}</TableCell>
                  <TableCell>{{ admin.avgResolutionTime }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-green-700">{{ admin.slaCompliance }}%</span>
                      <CheckCircle2 v-if="admin.slaCompliance >= 95" class="w-4 h-4 text-green-600" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" :class="getRatingColor(admin.rating)">
                      <Award class="w-3 h-3 mr-1" />
                      {{ admin.rating }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <!-- Technician Performance Tab -->
    <TabsContent value="technician" class="mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Kinerja Teknisi</CardTitle>
          <CardDescription>
            Performa teknisi berdasarkan tiket yang ditangani (diupdate oleh admin)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-start gap-2">
              <AlertCircle class="w-5 h-5 text-yellow-700 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-yellow-900">Catatan Penting</p>
                <p class="text-sm text-yellow-800 mt-1">
                  Teknisi tidak akses sistem secara langsung. Semua update pekerjaan teknisi
                  dilakukan oleh admin IT melalui sistem ticket management.
                </p>
              </div>
            </div>
          </div>

          <div class="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow class="bg-slate-50">
                  <TableHead class="font-semibold">Nama</TableHead>
                  <TableHead class="font-semibold">Spesialisasi</TableHead>
                  <TableHead class="font-semibold">Assigned</TableHead>
                  <TableHead class="font-semibold">Completed</TableHead>
                  <TableHead class="font-semibold">Avg Completion</TableHead>
                  <TableHead class="font-semibold">SLA Compliance</TableHead>
                  <TableHead class="font-semibold">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="tech in technicianPerformance" :key="tech.id" class="hover:bg-slate-50">
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <User class="w-4 h-4 text-yellow-700" />
                      </div>
                      <div>
                        <p class="font-medium">{{ tech.name }}</p>
                        <p class="text-xs text-slate-500">{{ tech.role }}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" class="bg-slate-50">
                      {{ tech.specialty }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-center">
                    <span class="font-semibold text-slate-900">{{ tech.assignedTickets }}</span>
                  </TableCell>
                  <TableCell class="text-center">
                    <span class="font-semibold text-green-700">{{ tech.completedTickets }}</span>
                  </TableCell>
                  <TableCell>{{ tech.avgCompletionTime }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-green-700">{{ tech.slaCompliance }}%</span>
                      <CheckCircle2 v-if="tech.slaCompliance >= 95" class="w-4 h-4 text-green-600" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" :class="getRatingColor(tech.rating)">
                      <Award class="w-3 h-3 mr-1" />
                      {{ tech.rating }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <!-- Daily Logs Tab -->
    <TabsContent value="daily" class="mt-6">
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="flex items-center gap-2">
                <Activity class="w-5 h-5 text-green-700" />
                Log Kinerja Harian
              </CardTitle>
              <CardDescription>
                Detail aktivitas dan kinerja setiap pegawai per hari
              </CardDescription>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  v-model="selectedDate"
                  class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <Select v-model="selectedStaff">
                <SelectTrigger class="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="staff in staffList" :key="staff.value" :value="staff.value">
                    {{ staff.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="filteredDailyLogs.length === 0" class="text-center py-12">
            <FileText class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500">Tidak ada log untuk tanggal dan staff yang dipilih</p>
          </div>
          <div v-else class="space-y-6">
            <div v-for="(log, index) in filteredDailyLogs" :key="index" class="border rounded-lg overflow-hidden">
              <!-- Staff Header -->
              <div class="bg-green-50 border-b border-green-200 p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <User class="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-slate-900">{{ log.staffName }}</h3>
                      <p class="text-sm text-slate-600">{{ log.role }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 text-sm">
                    <div class="text-center">
                      <p class="text-slate-600">Total Aktivitas</p>
                      <p class="font-bold text-green-700">{{ log.summary.totalActivities }}</p>
                    </div>
                    <div class="text-center">
                      <p class="text-slate-600">Tiket Handled</p>
                      <p class="font-bold text-green-700">{{ log.summary.ticketsHandled }}</p>
                    </div>
                    <div class="text-center">
                      <p class="text-slate-600">Resolved</p>
                      <p class="font-bold text-green-700">{{ log.summary.ticketsResolved }}</p>
                    </div>

                  </div>
                </div>
              </div>

              <!-- Activity Timeline -->
              <div class="p-4">
                <h4 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock class="w-4 h-4 text-green-700" />
                  Timeline Aktivitas
                </h4>
                <div class="space-y-2">
                  <div
                    v-for="(activity, activityIndex) in log.activities"
                    :key="activityIndex"
                    class="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div class="flex-shrink-0 w-16 text-sm font-medium text-slate-600">
                      {{ activity.time }}
                    </div>
                    <div class="flex-1">
                      <p class="text-sm text-slate-900">{{ activity.action }}</p>
                      <Badge
                        v-if="activity.ticketId"
                        variant="outline"
                        class="mt-1 bg-green-50 text-green-700 border-green-200 text-xs"
                      >
                        {{ activity.ticketId }}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>

</div>
</template>
