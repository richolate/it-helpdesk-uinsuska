<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  X, 
  Check, 
  Tag as TagIcon, 
  AlertCircle,
  Loader2,
  FileText,
  Bookmark,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Heading,
  List
} from 'lucide-vue-next';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useTicketStore } from '@/stores/useTicketStore';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();
const ticketStore = useTicketStore();
const auth = useAuth();

const isEditMode = ref(false);
const articleId = ref('');
const isLoading = ref(false);
const isSaving = ref(false);

// Form state
const title = ref('');
const content = ref('');
const category = ref('Jaringan');
const coverImage = ref<string | null>(null);
const tags = ref<string[]>([]);
const tagInput = ref('');
const relatedIncidentId = ref<string | null>(null);

// Categories listing
const categories = [
  { id: 'Jaringan', name: 'Jaringan' },
  { id: 'Akun', name: 'Akun' },
  { id: 'Perangkat', name: 'Perangkat' },
  { id: 'Software', name: 'Software' },
  { id: 'Infrastruktur', name: 'Infrastruktur' }
];

// Related incidents (tickets where isIncident = true)
const incidentTickets = ref<any[]>([]);

const fileInputRef = ref<HTMLInputElement | null>(null);
const editorRef = ref<HTMLDivElement | null>(null);

onMounted(async () => {
  // Fetch tickets to populate incidents
  await ticketStore.fetchTickets();
  incidentTickets.value = ticketStore.tickets.filter((t: any) => t.isIncident);
  
  // Check if editing
  if (route.params.id) {
    isEditMode.value = true;
    articleId.value = route.params.id as string;
    await fetchArticleData(articleId.value);
  } else {
    // Parse query params for incident-to-article conversion
    if (route.query.title) {
      title.value = route.query.title as string;
    }
    if (route.query.content) {
      content.value = route.query.content as string;
    }
    if (route.query.category) {
      category.value = route.query.category as string;
    }
    if (route.query.relatedIncidentId) {
      relatedIncidentId.value = route.query.relatedIncidentId as string;
    }
    
    await nextTick();
    if (editorRef.value) {
      editorRef.value.innerHTML = content.value;
    }
  }
});

async function fetchArticleData(id: string) {
  isLoading.value = true;
  try {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiBase}/api/articles/${id}`);
    if (res.ok) {
      const data = await res.json();
      title.value = data.title;
      content.value = data.content;
      category.value = data.category;
      coverImage.value = data.coverImage;
      relatedIncidentId.value = data.relatedIncidentId;
      
      // Parse tags
      if (data.tags) {
        tags.value = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      } else {
        tags.value = [];
      }
      
      isLoading.value = false;
      await nextTick();
      if (editorRef.value) {
        editorRef.value.innerHTML = content.value;
      }
    } else {
      notificationStore.addNotification({
        title: 'Gagal Memuat Artikel',
        message: 'Artikel tidak ditemukan atau terjadi kesalahan server.',
        type: 'error'
      });
      router.push('/admin/knowledge');
    }
  } catch (err) {
    console.error('Error fetching article:', err);
  } finally {
    isLoading.value = false;
  }
}

// Image handling
function triggerFileSelect() {
  fileInputRef.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    notificationStore.addNotification({
      title: 'Ukuran File Terlalu Besar',
      message: 'Ukuran gambar maksimal adalah 5MB.',
      type: 'warning'
    });
    return;
  }

  // Convert to Base64
  const reader = new FileReader();
  reader.onload = () => {
    coverImage.value = reader.result as string;
  };
  reader.readAsDataURL(file);
}

function removeCoverImage() {
  coverImage.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

// Tag handling
function addTag() {
  const val = tagInput.value.trim().replace(/,/g, '');
  if (val && !tags.value.includes(val)) {
    tags.value.push(val);
  }
  tagInput.value = '';
}

function removeTag(index: number) {
  tags.value.splice(index, 1);
}

// Rich Text Formatting Logic (direct visual command execution)
function formatText(type: 'bold' | 'italic' | 'underline' | 'justify' | 'center' | 'left' | 'bullet' | 'heading') {
  const editor = editorRef.value;
  if (!editor) return;

  editor.focus();

  switch (type) {
    case 'bold':
      document.execCommand('bold', false);
      break;
    case 'italic':
      document.execCommand('italic', false);
      break;
    case 'underline':
      document.execCommand('underline', false);
      break;
    case 'justify':
      document.execCommand('justifyFull', false);
      break;
    case 'center':
      document.execCommand('justifyCenter', false);
      break;
    case 'left':
      document.execCommand('justifyLeft', false);
      break;
    case 'heading':
      document.execCommand('formatBlock', false, '<h3>');
      break;
    case 'bullet':
      document.execCommand('insertUnorderedList', false);
      break;
  }

  // Update content.value with latest editor HTML markup
  content.value = editor.innerHTML;
}

function handleEditorInput() {
  if (editorRef.value) {
    content.value = editorRef.value.innerHTML;
  }
}

// Saving article
async function saveArticle(statusValue: 'Draft' | 'Published') {
  if (!title.value.trim()) {
    notificationStore.addNotification({
      title: 'Judul Diperlukan',
      message: 'Silakan isi judul artikel sebelum menyimpan.',
      type: 'warning'
    });
    return;
  }

  if (!content.value.trim()) {
    notificationStore.addNotification({
      title: 'Isi Artikel Diperlukan',
      message: 'Konten artikel tidak boleh kosong.',
      type: 'warning'
    });
    return;
  }

  isSaving.value = true;
  const user = auth.getCurrentUser();
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const payload = {
    title: title.value.trim(),
    content: content.value.trim(),
    category: category.value,
    tags: tags.value.join(', '),
    relatedIncidentId: relatedIncidentId.value,
    status: statusValue,
    coverImage: coverImage.value,
    authorNimNip: user?.nimNip
  };

  try {
    const url = isEditMode.value 
      ? `${apiBase}/api/articles/${articleId.value}`
      : `${apiBase}/api/articles`;
      
    const method = isEditMode.value ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      notificationStore.addNotification({
        title: isEditMode.value ? 'Artikel Diperbarui' : 'Artikel Dibuat',
        message: statusValue === 'Published' 
          ? `Artikel "${title.value}" berhasil diterbitkan.`
          : `Artikel "${title.value}" berhasil disimpan sebagai Draft.`,
        type: 'success'
      });
      router.push('/admin/knowledge');
    } else {
      const errData = await res.json();
      notificationStore.addNotification({
        title: 'Gagal Menyimpan',
        message: errData.error || 'Terjadi kesalahan saat menyimpan artikel.',
        type: 'error'
      });
    }
  } catch (err) {
    console.error('Error saving article:', err);
    notificationStore.addNotification({
      title: 'Koneksi Eror',
      message: 'Gagal terhubung ke server backend.',
      type: 'error'
    });
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/30">
    <!-- Top Nav / Back Header (Premium, Aligned Card) -->
    <div class="max-w-7xl mx-auto px-6 mt-6 mb-2">
      <div class="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            class="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full w-9 h-9 p-0 flex items-center justify-center border border-slate-200/60 shadow-sm"
            @click="router.push('/admin/knowledge')"
          >
            <ArrowLeft class="w-4 h-4" />
          </Button>
          <span class="text-sm font-bold text-slate-800 font-sans">Kembali ke Management</span>
        </div>
        
        <div class="flex items-center gap-3 lg:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            class="text-slate-700 font-bold rounded-xl border-slate-200"
            :disabled="isSaving"
            @click="saveArticle('Draft')"
          >
            Draft
          </Button>
          <Button 
            class="bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl" 
            size="sm"
            :disabled="isSaving"
            @click="saveArticle('Published')"
          >
            Terbitkan
          </Button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="max-w-7xl mx-auto px-6 pb-8 pt-2">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 class="w-10 h-10 text-green-700 animate-spin" />
        <p class="text-sm font-medium text-slate-500">Memuat artikel...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <!-- Medium-Style Editor Left Side (col-span 3) -->
        <div class="lg:col-span-3 space-y-6 bg-white p-8 rounded-2xl border border-slate-200/50 shadow-sm min-h-[700px]">
          
          <!-- Cover Image Uploader Box -->
          <div 
            class="relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all group duration-300"
            :class="[
              coverImage 
                ? 'border-transparent h-[360px]' 
                : 'border-slate-200 hover:border-green-600/50 bg-slate-50/50 hover:bg-slate-50 py-16 px-4 cursor-pointer'
            ]"
            @click="!coverImage && triggerFileSelect()"
          >
            <input 
              ref="fileInputRef" 
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="handleFileChange" 
            />

            <!-- Preview Cover Image -->
            <template v-if="coverImage">
              <img 
                :src="coverImage" 
                alt="Cover Preview" 
                class="w-full h-full object-cover rounded-xl" 
              />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button 
                  type="button" 
                  size="sm" 
                  class="bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl"
                  @click="triggerFileSelect"
                >
                  Ubah Gambar
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="destructive"
                  class="gap-1 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
                  @click="removeCoverImage"
                >
                  <X class="w-4 h-4" />
                  Hapus
                </Button>
              </div>
            </template>

            <!-- Blank/Upload State -->
            <template v-else>
              <div class="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-md text-slate-400 group-hover:text-green-700 group-hover:scale-105 transition-all mb-4">
                <ImageIcon class="w-6 h-6" />
              </div>
              <p class="font-bold text-slate-800 text-base mb-1">Tambahkan gambar sampul</p>
              <p class="text-xs text-slate-500">Disarankan rasio: 1200 × 630px (Max 5MB)</p>
            </template>
          </div>

          <!-- Rich Text Formatting Toolbar (Medium style inline tools) -->
          <div class="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200/60 rounded-xl mb-4">
            <Button type="button" variant="ghost" size="sm" class="h-8 w-8 p-0 hover:bg-slate-200/80 rounded-lg" title="Tebal (Bold)" @click="formatText('bold')">
              <Bold class="w-4 h-4 text-slate-700" />
            </Button>
            <Button type="button" variant="ghost" size="sm" class="h-8 w-8 p-0 hover:bg-slate-200/80 rounded-lg" title="Miring (Italic)" @click="formatText('italic')">
              <Italic class="w-4 h-4 text-slate-700" />
            </Button>
            <Button type="button" variant="ghost" size="sm" class="h-8 w-8 p-0 hover:bg-slate-200/80 rounded-lg" title="Garis Bawah (Underline)" @click="formatText('underline')">
              <Underline class="w-4 h-4 text-slate-700" />
            </Button>
            
            <div class="w-[1px] h-5 bg-slate-200 mx-1"></div>
            
            <Button type="button" variant="ghost" size="sm" class="h-8 w-8 p-0 hover:bg-slate-200/80 rounded-lg" title="Rata Kiri" @click="formatText('left')">
              <AlignLeft class="w-4 h-4 text-slate-700" />
            </Button>
            <Button type="button" variant="ghost" size="sm" class="h-8 w-8 p-0 hover:bg-slate-200/80 rounded-lg" title="Rata Tengah" @click="formatText('center')">
              <AlignCenter class="w-4 h-4 text-slate-700" />
            </Button>
            <Button type="button" variant="ghost" size="sm" class="h-8 w-8 p-0 hover:bg-slate-200/80 rounded-lg" title="Rata Kanan Kiri (Justify)" @click="formatText('justify')">
              <AlignJustify class="w-4 h-4 text-slate-700" />
            </Button>
            
            <div class="w-[1px] h-5 bg-slate-200 mx-1"></div>
            
            <Button type="button" variant="ghost" size="sm" class="h-8 w-8 p-0 hover:bg-slate-200/80 rounded-lg" title="Sub-judul (H3)" @click="formatText('heading')">
              <Heading class="w-4 h-4 text-slate-700" />
            </Button>
            <Button type="button" variant="ghost" size="sm" class="h-8 w-8 p-0 hover:bg-slate-200/80 rounded-lg" title="Daftar Bulatan" @click="formatText('bullet')">
              <List class="w-4 h-4 text-slate-700" />
            </Button>
          </div>

          <!-- Article Title Input -->
          <div class="pt-2">
            <textarea
              v-model="title"
              rows="1"
              placeholder="Judul Artikel..."
              class="w-full text-3xl md:text-4xl font-extrabold border-0 border-b border-transparent hover:border-slate-100 focus:border-slate-200 outline-none focus:ring-0 placeholder:text-slate-300 resize-none font-serif leading-tight py-2 transition-colors focus:outline-none"
              @input="(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }"
            ></textarea>
          </div>

          <!-- Article Content Input (WYSIWYG Rich Editor) -->
          <div class="editor-container">
            <div
              ref="editorRef"
              contenteditable="true"
              placeholder="Tuliskan isi artikel Anda di sini..."
              class="editor-content w-full text-lg border-0 outline-none focus:ring-0 min-h-[450px] focus:outline-none text-slate-800 leading-relaxed font-sans prose max-w-none"
              @input="handleEditorInput"
            ></div>
          </div>

        </div>

        <!-- Configurations Sidebar Right Side (col-span 1) -->
        <div class="space-y-6 lg:sticky lg:top-24">
          <Card class="border border-slate-200/60 shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardContent class="p-6 space-y-6">
              
              <!-- Category Configuration -->
              <div class="space-y-3">
                <Label class="text-xs font-bold uppercase tracking-wider text-slate-500">KATEGORI</Label>
                <div class="flex flex-col gap-2">
                  <div 
                    v-for="cat in categories" 
                    :key="cat.id"
                    class="flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer select-none transition-all duration-200"
                    :class="[
                      category === cat.id
                        ? 'border-green-600 bg-green-50/20 text-green-900 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    ]"
                    @click="category = cat.id"
                  >
                    <span class="text-sm font-semibold">{{ cat.name }}</span>
                    <div 
                      class="w-5 h-5 rounded-full flex items-center justify-center transition-all border"
                      :class="[
                        category === cat.id
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-slate-300 bg-white'
                      ]"
                    >
                      <Check v-if="category === cat.id" class="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              <hr class="border-slate-100" />

              <!-- Tags Configuration -->
              <div class="space-y-3">
                <Label class="text-xs font-bold uppercase tracking-wider text-slate-500">TAGS</Label>
                
                <div class="border border-slate-200 rounded-xl p-3 bg-white focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-all">
                  <div class="flex flex-wrap gap-1.5 mb-2" v-if="tags.length > 0">
                    <Badge 
                      v-for="(tag, idx) in tags" 
                      :key="tag" 
                      variant="secondary"
                      class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 gap-1.5 text-sm font-bold rounded-lg border border-slate-200 shadow-sm"
                    >
                      {{ tag }}
                      <button 
                        type="button" 
                        class="text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-200 p-0.5"
                        @click="removeTag(idx)"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </Badge>
                  </div>
                  <input 
                    v-model="tagInput"
                    placeholder="Tambah tag..." 
                    class="w-full text-sm border-0 outline-none p-0 focus:ring-0 focus:outline-none placeholder:text-slate-400"
                    @keydown.enter.prevent="addTag"
                    @keydown.comma.prevent="addTag"
                    @blur="addTag"
                  />
                </div>
                <p class="text-xs text-slate-400">Tekan Enter atau gunakan tanda koma (,) untuk menambahkan tag.</p>
              </div>

              <hr class="border-slate-100" />

              <!-- Related Incidents Configuration -->
              <div class="space-y-3">
                <Label class="text-xs font-bold uppercase tracking-wider text-slate-500">RELATED INCIDENT</Label>
                <Select v-model="relatedIncidentId">
                  <SelectTrigger class="w-full rounded-xl border-slate-200">
                    <SelectValue placeholder="Pilih tiket terkait..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="null">-- Tidak ada tiket terkait --</SelectItem>
                    <SelectItem 
                      v-for="incident in incidentTickets" 
                      :key="incident.id" 
                      :value="incident.id"
                    >
                      {{ incident.id }} - {{ incident.title }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p class="text-xs text-slate-400">Hubungkan artikel ini dengan tiket incident yang ada untuk mempermudah troubleshooting.</p>
              </div>

            </CardContent>
          </Card>

          <!-- Action buttons block for Desktop -->
          <div class="space-y-3 hidden lg:block">
            <Button 
              variant="outline" 
              class="w-full justify-center gap-2 rounded-xl py-6 font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm"
              :disabled="isSaving"
              @click="saveArticle('Draft')"
            >
              <Bookmark class="w-4 h-4 text-slate-500" />
              Simpan ke Draft
            </Button>
            <Button 
              class="w-full justify-center gap-2 rounded-xl py-6 font-bold bg-green-700 hover:bg-green-800 text-white shadow-md shadow-green-700/10"
              :disabled="isSaving"
              @click="saveArticle('Published')"
            >
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <FileText v-else class="w-4 h-4" />
              Terbitkan Artikel
            </Button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  position: relative;
}
.editor-content :deep(h3) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-family: Georgia, Cambria, "Times New Roman", Times, serif;
}
.editor-content :deep(ul) {
  list-style-type: disc;
  margin-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.editor-content :deep(li) {
  margin-top: 0.25rem;
}
.editor-content :deep(u) {
  text-decoration: underline;
}
.editor-content:empty:before {
  content: attr(placeholder);
  pointer-events: none;
  display: block;
  color: #cbd5e1;
}
</style>
