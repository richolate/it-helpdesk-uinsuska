<script setup lang="ts">
import { ref } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, BookOpen, Edit, Trash2, Eye, TrendingUp, CheckCircle, FileWarning, AlertTriangle } from "lucide-vue-next";

const createDialogOpen = ref(false);
const isLoading = ref(true);

setTimeout(() => {
  isLoading.value = false;
}, 1000);

const knowledgeArticles = [
  {
    id: "KB-001",
    title: "Cara mengatasi tidak bisa connect ke WiFi kampus",
    category: "Jaringan",
    status: "Published",
    author: "Ahmad Subhan",
    createdDate: "01 Mar 2026",
    updatedDate: "15 Mar 2026",
    views: 1254,
    helpful: 98,
    tags: ["WiFi", "Network", "Connection"],
    content: "Langkah-langkah troubleshooting WiFi kampus...",
    relatedTickets: 45,
  },
  {
    id: "KB-002",
    title: "Reset password akun iRaise",
    category: "Akun & Password",
    status: "Published",
    author: "Siti Nurhaliza",
    createdDate: "05 Mar 2026",
    updatedDate: "20 Mar 2026",
    views: 892,
    helpful: 95,
    tags: ["Password", "Account", "iRaise"],
    content: "Panduan lengkap reset password iRaise...",
    relatedTickets: 32,
  },
  {
    id: "KB-003",
    title: "Troubleshooting laptop tidak terdeteksi di jaringan",
    category: "Perangkat",
    status: "Published",
    author: "Budi Santoso",
    createdDate: "10 Mar 2026",
    updatedDate: "25 Mar 2026",
    views: 643,
    helpful: 88,
    tags: ["Laptop", "Network", "Device Registration"],
    content: "Solusi untuk masalah device registration...",
    relatedTickets: 28,
  },
  {
    id: "KB-004",
    title: "Setup VPN untuk akses dari luar kampus",
    category: "Jaringan",
    status: "Draft",
    author: "Ahmad Subhan",
    createdDate: "28 Mar 2026",
    updatedDate: "02 Apr 2026",
    views: 0,
    helpful: 0,
    tags: ["VPN", "Remote Access", "Security"],
    content: "Panduan instalasi dan konfigurasi VPN...",
    relatedTickets: 0,
  },
];

// Incident Repository - dari tiket yang ditandai sebagai incident
const incidentRepository = [
  {
    id: "INC-001",
    ticketId: "#1240",
    title: "Database Server Down - Disk Space Full",
    category: "Infrastruktur",
    severity: "Critical",
    resolution: "Cleanup old log files, expand disk partition, implement auto-cleanup script",
    rootCause: "Log files tidak pernah di-rotate, monitoring disk space tidak aktif",
    preventiveAction: "Setup log rotation policy, implement disk space monitoring alert",
    incidentNotes: "Major incident - Database crash karena disk space penuh. Sudah ditangani dengan cleanup dan monitoring.",
    createdBy: "Ahmad Subhan",
    createdDate: "04 Apr 2026",
    resolvedDate: "04 Apr 2026",
    downtime: "6 jam",
    affectedUsers: 500,
  },
  {
    id: "INC-002",
    ticketId: "#1156",
    title: "Network Outage Gedung Utama - Core Switch Failure",
    category: "Jaringan",
    severity: "High",
    resolution: "Replace failed core switch, restore configuration from backup",
    rootCause: "Hardware failure pada core switch, tidak ada redundancy",
    preventiveAction: "Implement redundant core switch, setup failover mechanism",
    incidentNotes: "Jaringan gedung utama down total. Switch utama rusak dan harus diganti. Konfigurasi di-restore dari backup.",
    createdBy: "Budi Santoso",
    createdDate: "28 Mar 2026",
    resolvedDate: "29 Mar 2026",
    downtime: "18 jam",
    affectedUsers: 800,
  },
];

const stats = [
  { label: "Total Articles", value: knowledgeArticles.length, change: "+2" },
  { label: "Published", value: knowledgeArticles.filter((a) => a.status === "Published").length, change: "+1" },
  { label: "Incidents Recorded", value: incidentRepository.length, change: "+1" },
  { label: "Avg Helpfulness", value: "94%", change: "+3%" },
];
</script>

<template>
<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Knowledge Management</h2>
      <p class="text-slate-600 mt-1">Kelola artikel, solusi, dan dokumentasi IT</p>
    </div>
    <Dialog v-model:open="createDialogOpen">
      <DialogTrigger asChild>
        <Button class="bg-green-600 hover:bg-green-700">
          <Plus class="w-4 h-4 mr-2" />
          Create Article
        </Button>
      </DialogTrigger>
      <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Knowledge Article</DialogTitle>
          <DialogDescription>
            Buat artikel baru untuk knowledge base
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 mt-4">
          <div class="space-y-2">
            <Label>Article Title *</Label>
            <Input placeholder="Contoh: Cara setup VPN untuk remote access" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Category *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="network">Jaringan</SelectItem>
                  <SelectItem value="account">Akun & Password</SelectItem>
                  <SelectItem value="device">Perangkat</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="infrastructure">Infrastruktur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Status *</Label>
              <Select defaultValue="draft">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label>Tags (comma separated)</Label>
            <Input placeholder="WiFi, Network, Connection" />
          </div>
          <div class="space-y-2">
            <Label>Content *</Label>
            <Textarea
              placeholder="Tulis artikel dalam format markdown..."
              rows="12"
              class="font-mono text-sm"
            />
          </div>
          <div class="space-y-2">
            <Label>Related Incidents (optional)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Link to existing incident" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="incident in incidentRepository" :key="incident.id" :value="incident.id">
                  {{ incident.title }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="createDialogOpen = false">
            Cancel
          </Button>
          <Button variant="outline">Save as Draft</Button>
          <Button class="bg-green-600 hover:bg-green-700" @click="createDialogOpen = false">
            Publish Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <template v-if="isLoading">
      <Card v-for="i in 4" :key="i">
        <CardContent class="pt-6">
          <div class="space-y-2">
            <div class="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
            <div class="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    </template>
    <template v-else>
      <Card v-for="stat in stats" :key="stat.label">
      <CardContent class="pt-6">
        <p class="text-sm text-slate-600 mb-1">{{ stat.label }}</p>
        <div class="flex items-baseline gap-2">
          <p class="text-3xl font-bold text-slate-900">{{ stat.value }}</p>
          <span class="text-sm font-medium text-green-600">{{ stat.change }}</span>
        </div>
      </CardContent>
    </Card>
    </template>
  </div>

  <!-- Tabs -->
  <Tabs defaultValue="articles" class="space-y-4">
    <TabsList>
      <TabsTrigger value="articles">
        Knowledge Articles ({{ knowledgeArticles.length }})
      </TabsTrigger>
      <TabsTrigger value="incidents">
        <FileWarning class="w-4 h-4 mr-2" />
        Incident Repository ({{ incidentRepository.length }})
      </TabsTrigger>
    </TabsList>

    <TabsContent value="articles" class="space-y-4">
      <!-- Search and Filter -->
      <Card>
        <CardContent class="pt-6">
          <div class="grid md:grid-cols-4 gap-4">
            <div class="md:col-span-2">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Cari artikel..." class="pl-10" />
              </div>
            </div>
            <Select defaultValue="all-category">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-category">Semua Kategori</SelectItem>
                <SelectItem value="network">Jaringan</SelectItem>
                <SelectItem value="account">Akun & Password</SelectItem>
                <SelectItem value="device">Perangkat</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-status">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">Semua Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <!-- Articles Grid -->
      <div v-if="isLoading" class="grid md:grid-cols-2 gap-6">
        <div v-for="i in 4" :key="i" class="h-64 bg-slate-100 animate-pulse rounded-xl w-full"></div>
      </div>
      <div v-else class="grid md:grid-cols-2 gap-6">
        <Card v-for="article in knowledgeArticles" :key="article.id" class="hover:shadow-md transition-shadow">
          <CardHeader>
            <div class="flex items-start justify-between mb-2">
              <Badge variant="outline" class="bg-green-50 text-green-700 border-green-200">
                {{ article.category }}
              </Badge>
              <Badge
                variant="outline"
                :class="[
                  article.status === 'Published'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                ]"
              >
                {{ article.status }}
              </Badge>
            </div>
            <CardTitle class="text-lg">{{ article.title }}</CardTitle>
            <CardDescription>
              {{ article.id }} • By {{ article.author }}
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Tags -->
            <div class="flex flex-wrap gap-2">
              <Badge v-for="tag in article.tags" :key="tag" variant="outline" class="text-xs">
                {{ tag }}
              </Badge>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4 py-3 border-y border-slate-200">
              <div class="text-center">
                <div class="flex items-center justify-center gap-1 mb-1">
                  <Eye class="w-4 h-4 text-slate-500" />
                  <p class="text-lg font-semibold text-slate-900">{{ article.views }}</p>
                </div>
                <p class="text-xs text-slate-500">Views</p>
              </div>
              <div class="text-center">
                <div class="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp class="w-4 h-4 text-green-500" />
                  <p class="text-lg font-semibold text-green-600">{{ article.helpful }}%</p>
                </div>
                <p class="text-xs text-slate-500">Helpful</p>
              </div>
              <div class="text-center">
                <div class="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  <p class="text-lg font-semibold text-green-600">{{ article.relatedTickets }}</p>
                </div>
                <p class="text-xs text-slate-500">Tickets</p>
              </div>
            </div>

            <!-- Dates -->
            <div class="text-xs text-slate-500">
              <p>Created: {{ article.createdDate }}</p>
              <p>Updated: {{ article.updatedDate }}</p>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-2">
              <Button variant="outline" size="sm" class="flex-1">
                <Eye class="w-4 h-4 mr-2" />
                View
              </Button>
              <Button variant="outline" size="sm" class="flex-1">
                <Edit class="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 class="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    <TabsContent value="incidents" class="space-y-4">
      <!-- Info Box -->
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-start gap-3">
          <AlertTriangle class="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-medium text-red-900">Incident Repository</p>
            <p class="text-sm text-red-800 mt-1">
              Daftar tiket yang telah ditandai sebagai incident oleh admin. Incident ini dicatat untuk
              pembelajaran dan referensi di masa depan dalam menangani kasus serupa.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident Repository</CardTitle>
          <CardDescription>
            Catatan incident dari tiket yang telah ditangani
          </CardDescription>
        </CardHeader>
        
        <div v-if="isLoading" class="space-y-4 px-6 pb-6">
          <div v-for="i in 3" :key="i" class="h-[200px] bg-slate-100 animate-pulse rounded-xl w-full"></div>
        </div>
        <CardContent v-else class="space-y-4">
          <div v-for="incident in incidentRepository" :key="incident.id" class="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50/50 transition-colors">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <Badge class="bg-red-600 text-white">
                    {{ incident.id }}
                  </Badge>
                  <Badge variant="outline" class="bg-slate-50">
                    Tiket {{ incident.ticketId }}
                  </Badge>
                  <Badge
                    variant="outline"
                    :class="[
                      incident.severity === 'Critical'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : incident.severity === 'High'
                        ? 'bg-orange-100 text-orange-700 border-orange-300'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    ]"
                  >
                    {{ incident.severity }}
                  </Badge>
                  <Badge variant="outline" class="bg-green-50 text-green-700 border-green-200">
                    {{ incident.category }}
                  </Badge>
                </div>
                <h3 class="font-semibold text-slate-900 mb-1">{{ incident.title }}</h3>
                <div class="flex items-center gap-4 text-xs text-slate-500">
                  <span>Downtime: {{ incident.downtime }}</span>
                  <span>•</span>
                  <span>Affected: {{ incident.affectedUsers }} users</span>
                  <span>•</span>
                  <span>By {{ incident.createdBy }}</span>
                  <span>•</span>
                  <span>{{ incident.createdDate }}</span>
                </div>
              </div>
            </div>

            <div class="space-y-3 text-sm mt-4">
              <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p class="font-medium text-slate-900 mb-1">📝 Incident Notes</p>
                <p class="text-slate-700">{{ incident.incidentNotes }}</p>
              </div>

              <div class="p-3 bg-green-50 rounded-lg border border-green-200">
                <p class="font-medium text-green-900 mb-1">✅ Resolution</p>
                <p class="text-green-800">{{ incident.resolution }}</p>
              </div>

              <div class="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p class="font-medium text-yellow-900 mb-1">🔍 Root Cause</p>
                <p class="text-yellow-800">{{ incident.rootCause }}</p>
              </div>

              <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p class="font-medium text-blue-900 mb-1">🛡️ Preventive Action</p>
                <p class="text-blue-800">{{ incident.preventiveAction }}</p>
              </div>
            </div>

            <div class="flex gap-2 mt-4 pt-4 border-t border-red-200">
              <Button variant="outline" size="sm" class="flex-1">
                <BookOpen class="w-4 h-4 mr-2" />
                Convert to Knowledge Article
              </Button>
              <Button variant="outline" size="sm" class="flex-1">
                <Eye class="w-4 h-4 mr-2" />
                View Original Ticket
              </Button>
            </div>
          </div>

          <div v-if="incidentRepository.length === 0" class="text-center py-12 text-slate-500">
            <FileWarning class="w-16 h-16 mx-auto mb-3 text-slate-300" />
            <p class="font-medium">Belum ada incident yang dicatat</p>
            <p class="text-sm mt-1">
              Incident akan muncul di sini ketika admin menandai tiket sebagai incident
            </p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</div>
</template>
