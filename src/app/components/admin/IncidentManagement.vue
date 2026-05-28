<script setup lang="ts">
import { ref } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle2, Clock, Search, Plus, FileText, Users } from "lucide-vue-next";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const createDialogOpen = ref(false);

const activeIncidents = [
  {
    id: "INC-2026-001",
    title: "Server Database Production Down",
    severity: "Critical",
    status: "In Progress",
    reportedBy: "Dr. Ahmad Fauzi",
    assignedTo: "Ahmad Subhan",
    startTime: "04 Apr 2026, 08:00",
    impact: "High - Semua aplikasi akademik tidak dapat diakses",
    affectedUsers: 500,
    diagnosis: "Disk space penuh menyebabkan database service crash",
    currentAction: "Cleanup disk dan restart database service",
    escalated: true,
    timeline: [
      { stage: "Detection", time: "08:00", status: "completed" },
      { stage: "Diagnosis", time: "08:30", status: "completed" },
      { stage: "Resolution", time: "09:00", status: "in-progress" },
      { stage: "Recovery", time: "-", status: "pending" },
      { stage: "Closure", time: "-", status: "pending" },
    ],
  },
  {
    id: "INC-2026-002",
    title: "Network Outage Gedung A",
    severity: "High",
    status: "Diagnosis",
    reportedBy: "Siti Aminah",
    assignedTo: "Budi Santoso",
    startTime: "04 Apr 2026, 09:30",
    impact: "Medium - Gedung A tidak ada koneksi internet",
    affectedUsers: 150,
    diagnosis: "Sedang investigasi core switch",
    currentAction: "Checking switch configuration dan physical connection",
    escalated: false,
    timeline: [
      { stage: "Detection", time: "09:30", status: "completed" },
      { stage: "Diagnosis", time: "09:45", status: "in-progress" },
      { stage: "Resolution", time: "-", status: "pending" },
      { stage: "Recovery", time: "-", status: "pending" },
      { stage: "Closure", time: "-", status: "pending" },
    ],
  },
];

const resolvedIncidents = [
  {
    id: "INC-2026-003",
    title: "Email Service Slow Performance",
    severity: "Medium",
    status: "Resolved",
    resolvedTime: "03 Apr 2026, 16:30",
    duration: "4 jam 30 menit",
    resolution: "Mail queue dibersihkan, service restarted. Performance kembali normal.",
    rootCause: "Mail queue overflow karena spam attack",
    preventiveAction: "Implement advanced spam filter, setup monitoring alert",
  },
];
</script>

<template>
<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-slate-900">Incident Management</h2>
      <p class="text-slate-600 mt-1">Kelola incident IT dengan workflow ITIL</p>
    </div>
    <Dialog v-model:open="createDialogOpen">
      <DialogTrigger asChild>
        <Button class="bg-red-600 hover:bg-red-700">
          <Plus class="w-4 h-4 mr-2" />
          Create Incident
        </Button>
      </DialogTrigger>
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Incident</DialogTitle>
          <DialogDescription>
            Buat incident record untuk masalah yang memerlukan penanganan segera
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 mt-4">
          <div class="space-y-2">
            <Label>Incident Title *</Label>
            <Input placeholder="Contoh: Critical server outage" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Severity *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Assign To *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ahmad">Ahmad Subhan</SelectItem>
                  <SelectItem value="budi">Budi Santoso</SelectItem>
                  <SelectItem value="siti">Siti Nurhaliza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label>Impact Description *</Label>
            <Textarea placeholder="Jelaskan dampak incident terhadap layanan..." rows="3" />
          </div>
          <div class="space-y-2">
            <Label>Affected Users (estimated)</Label>
            <Input type="number" placeholder="0" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="createDialogOpen = false">
            Cancel
          </Button>
          <Button class="bg-red-600 hover:bg-red-700" @click="createDialogOpen = false">
            Create Incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-slate-600 mb-1">Active Incidents</p>
            <p class="text-3xl font-bold text-slate-900">{{ activeIncidents.length }}</p>
          </div>
          <div class="bg-red-50 p-3 rounded-lg">
            <AlertTriangle class="w-6 h-6 text-red-600" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-slate-600 mb-1">Critical</p>
            <p class="text-3xl font-bold text-red-600">1</p>
          </div>
          <div class="bg-red-50 p-3 rounded-lg">
            <AlertTriangle class="w-6 h-6 text-red-600" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-slate-600 mb-1">Avg Resolution Time</p>
            <p class="text-3xl font-bold text-slate-900">3.5h</p>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <Clock class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-slate-600 mb-1">Resolved (30d)</p>
            <p class="text-3xl font-bold text-green-600">28</p>
          </div>
          <div class="bg-green-50 p-3 rounded-lg">
            <CheckCircle2 class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Incidents Tabs -->
  <Tabs defaultValue="active" class="space-y-4">
    <TabsList>
      <TabsTrigger value="active">
        Active Incidents ({{ activeIncidents.length }})
      </TabsTrigger>
      <TabsTrigger value="resolved">Resolved</TabsTrigger>
    </TabsList>

    <TabsContent value="active" class="space-y-4">
      <Card v-for="incident in activeIncidents" :key="incident.id" class="border-2 border-slate-200">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <CardTitle class="text-lg">{{ incident.id }}</CardTitle>
                <Badge
                  variant="outline"
                  :class="[
                    incident.severity === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' :
                    incident.severity === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                  ]"
                >
                  {{ incident.severity }}
                </Badge>
                <Badge variant="outline" class="bg-green-100 text-green-700 border-green-200">
                  {{ incident.status }}
                </Badge>
                <Badge v-if="incident.escalated" variant="outline" class="bg-purple-100 text-purple-700 border-purple-200">
                  Escalated
                </Badge>
              </div>
              <h3 class="font-semibold text-slate-900 mb-1">{{ incident.title }}</h3>
              <div class="flex items-center gap-4 text-sm text-slate-600">
                <span>Started: {{ incident.startTime }}</span>
                <span>•</span>
                <span>Assigned: {{ incident.assignedTo }}</span>
                <span>•</span>
                <span>Affected: {{ incident.affectedUsers }} users</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Impact -->
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-start gap-2">
              <AlertTriangle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-medium text-red-900 mb-1">Impact</p>
                <p class="text-sm text-red-700">{{ incident.impact }}</p>
              </div>
            </div>
          </div>

          <!-- Diagnosis & Action -->
          <div class="grid md:grid-cols-2 gap-4">
            <div class="p-4 bg-green-50 rounded-lg">
              <p class="text-sm font-medium text-green-900 mb-2">Diagnosis</p>
              <p class="text-sm text-green-700">{{ incident.diagnosis }}</p>
            </div>
            <div class="p-4 bg-green-50 rounded-lg">
              <p class="text-sm font-medium text-green-900 mb-2">Current Action</p>
              <p class="text-sm text-green-700">{{ incident.currentAction }}</p>
            </div>
          </div>

          <!-- Timeline -->
          <div>
            <p class="text-sm font-medium text-slate-900 mb-3">Incident Workflow</p>
            <div class="flex items-center justify-between relative">
              <div v-for="(stage, index) in incident.timeline" :key="index" class="flex flex-col items-center flex-1 relative">
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center mb-2 z-10 relative',
                    stage.status === 'completed' ? 'bg-green-500' :
                    stage.status === 'in-progress' ? 'bg-green-500 animate-pulse' :
                    'bg-slate-300'
                  ]"
                >
                  <CheckCircle2 v-if="stage.status === 'completed'" class="w-5 h-5 text-white" />
                  <Clock v-else-if="stage.status === 'in-progress'" class="w-5 h-5 text-white" />
                  <div v-else class="w-3 h-3 bg-white rounded-full" />
                </div>
                <p
                  :class="[
                    'text-xs font-medium',
                    stage.status === 'pending' ? 'text-slate-400' : 'text-slate-900'
                  ]"
                >
                  {{ stage.stage }}
                </p>
                <p class="text-xs text-slate-500">{{ stage.time }}</p>
                <div v-if="index < incident.timeline.length - 1" class="absolute w-full h-0.5 bg-slate-300 top-5 left-[50%]" />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t">
            <Button variant="outline" class="flex-1">
              <FileText class="w-4 h-4 mr-2" />
              Update Status
            </Button>
            <Button variant="outline" class="flex-1">
              <Users class="w-4 h-4 mr-2" />
              Escalate
            </Button>
            <Button class="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle2 class="w-4 h-4 mr-2" />
              Resolve
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="resolved" class="space-y-4">
      <Card>
        <CardContent class="pt-6">
          <div class="relative mb-4">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Cari resolved incidents..." class="pl-10" />
          </div>

          <div class="space-y-4">
            <div v-for="incident in resolvedIncidents" :key="incident.id" class="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-semibold text-slate-900">{{ incident.id }}</h4>
                    <Badge variant="outline" class="bg-green-100 text-green-700 border-green-200">
                      {{ incident.status }}
                    </Badge>
                    <Badge
                      variant="outline"
                      :class="[
                        incident.severity === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      ]"
                    >
                      {{ incident.severity }}
                    </Badge>
                  </div>
                  <h3 class="text-sm font-medium text-slate-900">{{ incident.title }}</h3>
                  <p class="text-xs text-slate-500 mt-1">
                    Resolved: {{ incident.resolvedTime }} • Duration: {{ incident.duration }}
                  </p>
                </div>
              </div>

              <div class="space-y-3 text-sm">
                <div class="p-3 bg-green-50 rounded-lg">
                  <p class="font-medium text-green-900 mb-1">Resolution</p>
                  <p class="text-green-700">{{ incident.resolution }}</p>
                </div>
                <div class="p-3 bg-green-50 rounded-lg">
                  <p class="font-medium text-green-900 mb-1">Root Cause</p>
                  <p class="text-green-700">{{ incident.rootCause }}</p>
                </div>
                <div class="p-3 bg-purple-50 rounded-lg">
                  <p class="font-medium text-purple-900 mb-1">Preventive Action</p>
                  <p class="text-purple-700">{{ incident.preventiveAction }}</p>
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
