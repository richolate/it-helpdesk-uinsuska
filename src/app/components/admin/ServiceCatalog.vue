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
import { Search, Plus, Settings, Download, Users, Key, Mail, HardDrive, Wifi, Monitor } from "lucide-vue-next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const createDialogOpen = ref(false);

const serviceCategories = [
  {
    name: "Account Services",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
    services: 5,
  },
  {
    name: "Software Installation",
    icon: Download,
    color: "text-green-600",
    bgColor: "bg-green-50",
    services: 8,
  },
  {
    name: "Hardware Request",
    icon: Monitor,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    services: 6,
  },
  {
    name: "Network Access",
    icon: Wifi,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    services: 4,
  },
];

const services = [
  {
    id: "SVC-001",
    name: "Password Reset",
    category: "Account Services",
    icon: Key,
    description: "Reset password untuk akun iRaise, email, atau sistem lainnya",
    sla: "2 jam",
    approvalRequired: false,
    automatable: true,
    requestCount: 145,
    avgTime: "0.5h",
    fields: ["Username/NIM", "Email", "Reason"],
    status: "Active",
  },
  {
    id: "SVC-002",
    name: "New Account Creation",
    category: "Account Services",
    icon: Users,
    description: "Buat akun baru untuk mahasiswa, dosen, atau staff",
    sla: "1 hari",
    approvalRequired: true,
    automatable: false,
    requestCount: 58,
    avgTime: "4h",
    fields: ["Full Name", "NIM/NIP", "Email", "Role", "Department"],
    status: "Active",
  },
  {
    id: "SVC-003",
    name: "Microsoft Office Installation",
    category: "Software Installation",
    icon: Download,
    description: "Install Microsoft Office 365 di perangkat user",
    sla: "4 jam",
    approvalRequired: false,
    automatable: false,
    requestCount: 89,
    avgTime: "2h",
    fields: ["Device Type", "OS Version", "Location"],
    status: "Active",
  },
  {
    id: "SVC-004",
    name: "Email Configuration",
    category: "Account Services",
    icon: Mail,
    description: "Setup email kampus di device (Outlook, mobile, dll)",
    sla: "3 jam",
    approvalRequired: false,
    automatable: false,
    requestCount: 112,
    avgTime: "1h",
    fields: ["Email Address", "Device Type", "Email Client"],
    status: "Active",
  },
  {
    id: "SVC-005",
    name: "Storage Quota Increase",
    category: "Account Services",
    icon: HardDrive,
    description: "Request peningkatan storage quota untuk OneDrive atau network drive",
    sla: "1 hari",
    approvalRequired: true,
    automatable: false,
    requestCount: 34,
    avgTime: "6h",
    fields: ["Current Quota", "Requested Quota", "Justification"],
    status: "Active",
  },
  {
    id: "SVC-006",
    name: "WiFi Access Registration",
    category: "Network Access",
    icon: Wifi,
    description: "Registrasi device untuk akses WiFi kampus",
    sla: "2 jam",
    approvalRequired: false,
    automatable: true,
    requestCount: 203,
    avgTime: "0.3h",
    fields: ["Device Name", "MAC Address", "Device Type"],
    status: "Active",
  },
];

const requests = [
  {
    id: "SR-2026-125",
    service: "Password Reset",
    requester: "John Doe",
    department: "Fakultas Teknik",
    status: "Completed",
    submittedDate: "04 Apr 2026, 10:00",
    completedDate: "04 Apr 2026, 10:25",
    assignedTo: "Siti Nurhaliza",
  },
  {
    id: "SR-2026-124",
    service: "Microsoft Office Installation",
    requester: "Jane Smith",
    department: "Fakultas Ekonomi",
    status: "In Progress",
    submittedDate: "04 Apr 2026, 09:30",
    completedDate: "-",
    assignedTo: "Ahmad Subhan",
  },
  {
    id: "SR-2026-123",
    service: "New Account Creation",
    requester: "Dr. Ahmad Fauzi",
    department: "Fakultas MIPA",
    status: "Pending Approval",
    submittedDate: "04 Apr 2026, 08:15",
    completedDate: "-",
    assignedTo: "-",
  },
];

const topServices = [...services].sort((a, b) => b.requestCount - a.requestCount).slice(0, 5);

const volumeData = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 52 },
  { day: "Wed", value: 38 },
  { day: "Thu", value: 61 },
  { day: "Fri", value: 48 },
  { day: "Sat", value: 28 },
  { day: "Sun", value: 15 },
];
</script>

<template>
<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Service Request Catalog</h2>
      <p class="text-slate-600 mt-1">Kelola layanan IT yang dapat diminta oleh user</p>
    </div>
    <Dialog v-model:open="createDialogOpen">
      <DialogTrigger asChild>
        <Button class="bg-green-600 hover:bg-green-700">
          <Plus class="w-4 h-4 mr-2" />
          Create Service
        </Button>
      </DialogTrigger>
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Service</DialogTitle>
          <DialogDescription>
            Tambahkan layanan baru ke service catalog
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 mt-4">
          <div class="space-y-2">
            <Label>Service Name *</Label>
            <Input placeholder="Contoh: Software License Request" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Category *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Account Services</SelectItem>
                  <SelectItem value="software">Software Installation</SelectItem>
                  <SelectItem value="hardware">Hardware Request</SelectItem>
                  <SelectItem value="network">Network Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>SLA Time *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select SLA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2h">2 hours</SelectItem>
                  <SelectItem value="4h">4 hours</SelectItem>
                  <SelectItem value="1d">1 day</SelectItem>
                  <SelectItem value="2d">2 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label>Description *</Label>
            <Textarea placeholder="Deskripsi lengkap layanan..." rows="3" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="flex items-center gap-2">
                <input type="checkbox" class="rounded" />
                Requires Approval
              </Label>
            </div>
            <div class="space-y-2">
              <Label class="flex items-center gap-2">
                <input type="checkbox" class="rounded" />
                Automatable
              </Label>
            </div>
          </div>
          <div class="space-y-2">
            <Label>Required Fields (comma separated)</Label>
            <Input placeholder="Full Name, Email, Department" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="createDialogOpen = false">
            Cancel
          </Button>
          <Button class="bg-green-600 hover:bg-green-700" @click="createDialogOpen = false">
            Create Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>

  <!-- Service Categories -->
  <div>
    <h3 class="text-lg font-semibold text-slate-900 mb-4">Service Categories</h3>
    <div class="grid md:grid-cols-4 gap-4">
      <Card v-for="category in serviceCategories" :key="category.name" class="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent class="pt-6">
          <div :class="[category.bgColor, 'w-12 h-12 rounded-lg flex items-center justify-center mb-3']">
            <component :is="category.icon" :class="['w-6 h-6', category.color]" />
          </div>
          <h4 class="font-semibold text-slate-900 mb-1">{{ category.name }}</h4>
          <p class="text-sm text-slate-500">{{ category.services }} services</p>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Tabs -->
  <Tabs defaultValue="services" class="space-y-4">
    <TabsList>
      <TabsTrigger value="services">
        Available Services ({{ services.length }})
      </TabsTrigger>
      <TabsTrigger value="requests">
        Service Requests ({{ requests.length }})
      </TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
    </TabsList>

    <TabsContent value="services" class="space-y-4">
      <!-- Search -->
      <Card>
        <CardContent class="pt-6">
          <div class="grid md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <div class="relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Cari service..." class="pl-10" />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="account">Account Services</SelectItem>
                <SelectItem value="software">Software Installation</SelectItem>
                <SelectItem value="hardware">Hardware Request</SelectItem>
                <SelectItem value="network">Network Access</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <!-- Services Grid -->
      <div class="grid md:grid-cols-2 gap-6">
        <Card v-for="service in services" :key="service.id" class="hover:shadow-md transition-shadow">
          <CardHeader>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <component :is="service.icon" class="w-6 h-6 text-green-600" />
              </div>
              <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle class="text-lg">{{ service.name }}</CardTitle>
                    <p class="text-xs text-slate-500 mt-1">{{ service.id }}</p>
                  </div>
                  <Badge variant="outline" class="bg-green-50 text-green-700 border-green-200">
                    {{ service.status }}
                  </Badge>
                </div>
                <Badge variant="outline" class="bg-slate-50 text-slate-600 border-slate-200">
                  {{ service.category }}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <p class="text-sm text-slate-600">{{ service.description }}</p>

            <!-- Service Details -->
            <div class="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg text-sm">
              <div>
                <p class="text-slate-500 mb-1">SLA Time</p>
                <p class="font-medium text-slate-900">{{ service.sla }}</p>
              </div>
              <div>
                <p class="text-slate-500 mb-1">Avg. Time</p>
                <p class="font-medium text-slate-900">{{ service.avgTime }}</p>
              </div>
            </div>

            <!-- Badges -->
            <div class="flex flex-wrap gap-2">
              <Badge v-if="service.approvalRequired" variant="outline" class="bg-orange-50 text-orange-700 border-orange-200">
                Requires Approval
              </Badge>
              <Badge v-if="service.automatable" variant="outline" class="bg-green-50 text-green-700 border-green-200">
                Automatable
              </Badge>
            </div>

            <!-- Stats -->
            <div class="flex items-center justify-between pt-3 border-t">
              <div class="text-center">
                <p class="text-2xl font-bold text-green-600">{{ service.requestCount }}</p>
                <p class="text-xs text-slate-500">Requests (30d)</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-500 mb-1">Required Fields:</p>
                <p class="text-xs font-medium text-slate-700">{{ service.fields.join(", ") }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <Button variant="outline" size="sm" class="flex-1">
                <Settings class="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Button variant="outline" size="sm" class="flex-1">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>

    <TabsContent value="requests" class="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Service Requests</CardTitle>
          <CardDescription>Monitor dan kelola service request</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow class="bg-slate-50">
                  <TableHead class="font-semibold">Request ID</TableHead>
                  <TableHead class="font-semibold">Service</TableHead>
                  <TableHead class="font-semibold">Requester</TableHead>
                  <TableHead class="font-semibold">Department</TableHead>
                  <TableHead class="font-semibold">Status</TableHead>
                  <TableHead class="font-semibold">Submitted</TableHead>
                  <TableHead class="font-semibold">Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="request in requests" :key="request.id" class="hover:bg-slate-50">
                  <TableCell class="font-medium">{{ request.id }}</TableCell>
                  <TableCell>{{ request.service }}</TableCell>
                  <TableCell>{{ request.requester }}</TableCell>
                  <TableCell class="text-sm">{{ request.department }}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      :class="[
                        request.status === 'Completed' || request.status === 'In Progress'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      ]"
                    >
                      {{ request.status }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-sm">{{ request.submittedDate }}</TableCell>
                  <TableCell class="text-sm">{{ request.assignedTo }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="analytics" class="space-y-4">
      <div class="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Requested Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div v-for="(service, index) in topServices" :key="service.id" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-slate-500">{{ index + 1 }}.</span>
                  <span class="text-sm text-slate-900">{{ service.name }}</span>
                </div>
                <Badge variant="outline">{{ service.requestCount }}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fulfillment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-slate-600">On-Time Completion</span>
                  <span class="text-sm font-medium text-green-600">94%</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-green-600 h-2 rounded-full" style="width: 94%" />
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-slate-600">First-Time Resolution</span>
                  <span class="text-sm font-medium text-green-600">88%</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-green-600 h-2 rounded-full" style="width: 88%" />
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-slate-600">Customer Satisfaction</span>
                  <span class="text-sm font-medium text-purple-600">96%</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-purple-600 h-2 rounded-full" style="width: 96%" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Volume (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div v-for="item in volumeData" :key="item.day" class="flex items-center gap-3">
                <span class="text-sm text-slate-600 w-10">{{ item.day }}</span>
                <div class="flex-1 bg-slate-200 rounded-full h-6 relative">
                  <div
                    class="bg-green-600 h-6 rounded-full flex items-center justify-end pr-2"
                    :style="`width: ${(item.value / 70) * 100}%`"
                  >
                    <span class="text-xs text-white font-medium">{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  </Tabs>
</div>
</template>
