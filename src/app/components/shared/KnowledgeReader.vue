<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  FileWarning, 
  Tag as TagIcon,
  Loader2,
  ChevronRight,
  AlertTriangle
} from 'lucide-vue-next';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const router = useRouter();
const notificationStore = useNotificationStore();
const auth = useAuth();

const articleId = ref('');
const isLoading = ref(true);
const isDeleting = ref(false);
const showDeleteDialog = ref(false);
const article = ref<any>(null);

const currentUser = computed(() => auth.getCurrentUser());
const isAdmin = computed(() => currentUser.value?.role === 'Admin IT');

onMounted(async () => {
  articleId.value = route.params.id as string;
  await fetchArticle(articleId.value);
});

async function fetchArticle(id: string) {
  isLoading.value = true;
  try {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const user = auth.getCurrentUser();
    const queryParam = user ? `?userNimNip=${encodeURIComponent(user.nimNip)}` : '';
    
    const res = await fetch(`${apiBase}/api/articles/${id}${queryParam}`);
    if (res.ok) {
      article.value = await res.json();
    } else {
      notificationStore.addNotification({
        title: 'Artikel Tidak Ditemukan',
        message: 'Artikel yang Anda cari tidak dapat ditemukan.',
        type: 'error'
      });
      goBack();
    }
  } catch (err) {
    console.error('Error fetching article:', err);
    notificationStore.addNotification({
      title: 'Kesalahan Jaringan',
      message: 'Gagal memuat artikel dari server.',
      type: 'error'
    });
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  if (isAdmin.value) {
    router.push('/admin/knowledge');
  } else {
    router.push('/user/knowledge-base');
  }
}

function editArticle() {
  router.push(`/admin/knowledge/editor/${articleId.value}`);
}

async function confirmDelete() {
  showDeleteDialog.value = false;
  isDeleting.value = true;
  try {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiBase}/api/articles/${articleId.value}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      notificationStore.addNotification({
        title: 'Artikel Dihapus',
        message: `Artikel "${article.value.title}" berhasil dihapus.`,
        type: 'success'
      });
      router.push('/admin/knowledge');
    } else {
      notificationStore.addNotification({
        title: 'Gagal Menghapus',
        message: 'Gagal menghapus artikel dari server.',
        type: 'error'
      });
    }
  } catch (err) {
    console.error('Error deleting article:', err);
    notificationStore.addNotification({
      title: 'Kesalahan Jaringan',
      message: 'Gagal terhubung ke server untuk menghapus artikel.',
      type: 'error'
    });
  } finally {
    isDeleting.value = false;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr.replace('Z', ''));
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

const tagList = computed(() => {
  if (!article.value?.tags) return [];
  return article.value.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
});

// Safe HTML renderer for styled content
// Safe DOM-based HTML Sanitizer to permit safe rich styling while blocking XSS vectors
function sanitizeHTML(rawHtml: string): string {
  if (!rawHtml) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    
    const allowedTags = new Set([
      'DIV', 'P', 'SPAN', 'B', 'STRONG', 'I', 'EM', 'U', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 
      'UL', 'OL', 'LI', 'BR', 'HR', 'IMG', 'A', 'BLOCKQUOTE', 'PRE', 'CODE'
    ]);
    const allowedAttributes = new Set(['class', 'style', 'href', 'src', 'alt', 'target', 'title']);

    function cleanNode(node: Node) {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          const tagName = el.tagName;
          
          if (!allowedTags.has(tagName)) {
            if (['SCRIPT', 'IFRAME', 'STYLE', 'LINK', 'OBJECT', 'EMBED'].includes(tagName)) {
              el.remove();
            } else {
              const textNode = doc.createTextNode(el.textContent || '');
              el.parentNode?.replaceChild(textNode, el);
            }
          } else {
            const attrs = Array.from(el.attributes);
            for (const attr of attrs) {
              const attrName = attr.name.toLowerCase();
              if (!allowedAttributes.has(attrName) || attrName.startsWith('on')) {
                el.removeAttribute(attr.name);
              }
            }
            cleanNode(el);
          }
        } else if (child.nodeType !== Node.TEXT_NODE) {
          child.remove();
        }
      }
    }

    cleanNode(doc.body);
    return doc.body.innerHTML;
  } catch (e) {
    console.error('HTML Sanitization failed, falling back to escaped string:', e);
    return rawHtml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

const renderedContent = computed(() => {
  if (!article.value?.content) return '';
  let html = article.value.content;
  
  // Whitelist-sanitize HTML tags and inline styles (e.g. text-align, font styles, colors)
  html = sanitizeHTML(html);
  
  // Parse legacy markdown formatting for backwards compatibility
  html = html.replace(/\*\*([^\n*]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^\n*]+?)\*/g, '<em>$1</em>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-2xl font-bold font-serif text-slate-800 mt-8 mb-4">$1</h3>');
  html = html.replace(/^- (.*?)$/gm, '<li class="list-disc ml-6 mt-1.5 text-slate-700">$1</li>');
  
  return html;
});

function viewRelatedTicket() {
  if (!article.value?.relatedIncidentId) return;
  const ticketId = article.value.relatedIncidentId;
  if (isAdmin.value) {
    router.push(`/admin/tickets/${ticketId}`);
  } else {
    router.push(`/user/tickets/${ticketId}`);
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/30 pb-20">
    <!-- Top Action Bar Header Card (Premium, Aligned Card) -->
    <div class="max-w-3xl mx-auto px-6 mt-6 mb-2">
      <div class="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            class="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full w-9 h-9 p-0 flex items-center justify-center border border-slate-200/60 shadow-sm"
            @click="goBack"
          >
            <ArrowLeft class="w-4 h-4" />
          </Button>
          <span class="text-sm font-bold text-slate-800 font-sans">Kembali</span>
        </div>

        <!-- Admin Only Actions with High Contrast Buttons -->
        <div v-if="isAdmin && article" class="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            class="text-slate-800 gap-1.5 font-bold border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 border shadow-sm"
            @click="editArticle"
          >
            <Edit class="w-3.5 h-3.5" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            class="gap-1.5 font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm px-4 py-2"
            :disabled="isDeleting"
            @click="showDeleteDialog = true"
          >
            <Loader2 v-if="isDeleting" class="w-3.5 h-3.5 animate-spin" />
            <Trash2 v-else class="w-3.5 h-3.5" />
            Hapus
          </Button>
        </div>
      </div>
    </div>

    <!-- Reader Body Container -->
    <div class="max-w-3xl mx-auto px-6 mt-4">
      <!-- Loading Skeleton State -->
      <div v-if="isLoading" class="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div class="w-full h-[300px] bg-slate-100 animate-pulse rounded-2xl"></div>
        <div class="flex items-center justify-between">
          <div class="h-6 w-24 bg-slate-100 animate-pulse rounded-full"></div>
          <div class="h-6 w-16 bg-slate-100 animate-pulse rounded-full"></div>
        </div>
        <div class="h-10 w-3/4 bg-slate-100 animate-pulse rounded-lg"></div>
      </div>

      <article v-else-if="article" class="space-y-8 bg-white p-8 md:p-12 rounded-3xl border border-slate-200/50 shadow-md">
        
        <!-- Cover Image -->
        <div v-if="article.coverImage" class="w-full max-h-[420px] rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 bg-slate-100">
          <img 
            :src="article.coverImage" 
            alt="Article Cover" 
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Meta Category and Status -->
        <div class="flex items-center justify-between">
          <Badge class="bg-green-50 hover:bg-green-100 text-green-800 border-green-200 font-bold px-4 py-1.5 rounded-full text-xs shadow-sm">
            {{ article.category }}
          </Badge>
          <Badge 
            v-if="isAdmin"
            variant="outline"
            :class="[
              article.status === 'Published' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            ]"
            class="text-xs px-3 py-1 rounded-lg font-bold shadow-sm"
          >
            {{ article.status }}
          </Badge>
        </div>

        <!-- Article Title (Large and Bold) -->
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold font-serif text-slate-900 leading-tight">
          {{ article.title }}
        </h1>

        <!-- Author / Date / Views Header Info (Premium Design) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-y border-slate-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-green-50 to-green-100 flex items-center justify-center text-green-700 border border-green-200/40 flex-shrink-0">
              <User class="w-6 h-6" />
            </div>
            <div class="min-w-0">
              <p class="font-bold text-slate-900 text-base">
                {{ article.author?.name || 'Admin IT' }}
              </p>
              <div class="flex items-center gap-2 text-xs text-slate-400 mt-1 font-semibold">
                <Calendar class="w-4 h-4 text-slate-400" />
                {{ formatDate(article.createdAt) }}
              </div>
            </div>
          </div>

          <!-- Elegant Views Indicator -->
          <div class="flex items-center self-start sm:self-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full text-green-800 font-extrabold text-sm shadow-sm hover:shadow transition-shadow">
            <Eye class="w-4.5 h-4.5 text-green-600 flex-shrink-0 animate-pulse" />
            <span>{{ article.views }} Kali Dibaca</span>
          </div>
        </div>

        <!-- Article content formatted with larger, readable Medium-style font -->
        <div class="text-slate-800 text-lg md:text-[19px] leading-relaxed font-sans whitespace-pre-line space-y-4 pt-2" v-html="renderedContent">
        </div>

        <!-- Tags badge chips -->
        <div v-if="tagList.length > 0" class="flex flex-wrap gap-2 pt-6 border-t border-slate-100">
          <div class="flex items-center gap-1.5 text-slate-450 text-sm font-bold mr-1">
            <TagIcon class="w-4.5 h-4.5 text-slate-400" />
            TAGS:
          </div>
          <Badge 
            v-for="tag in tagList" 
            :key="tag" 
            variant="secondary" 
            class="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-sm px-3.5 py-1.5 font-bold shadow-sm"
          >
            {{ tag }}
          </Badge>
        </div>

        <!-- Related Incident Notification Card -->
        <Card 
          v-if="article.relatedIncidentId" 
          class="border border-red-100 bg-red-50/20 hover:bg-red-50/40 transition-colors mt-8 rounded-2xl cursor-pointer"
          @click="viewRelatedTicket"
        >
          <CardContent class="p-5">
            <div class="flex items-start gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 shadow-sm border border-red-200/20">
                <FileWarning class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-red-900 text-sm">Tiket Incident Terkait</h4>
                <p class="text-xs text-red-800 mt-0.5 font-medium">
                  Artikel ini dibuat berdasarkan incident {{ article.relatedIncidentId }}
                </p>
                <p class="text-slate-600 text-sm mt-2 font-bold line-clamp-1">
                  {{ article.relatedIncident?.title || 'Klik untuk melihat detail incident' }}
                </p>
              </div>
              <div class="self-center text-red-500">
                <ChevronRight class="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

      </article>
    </div>

    <!-- Custom Deletion Dialog (High Contrast Buttons) -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="max-w-md rounded-2xl">
        <DialogHeader class="flex flex-col items-center text-center">
          <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3 border border-red-200/20">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <DialogTitle class="text-slate-900 text-lg font-bold">Hapus Artikel Knowledge</DialogTitle>
          <DialogDescription class="text-slate-500 text-sm mt-2">
            Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini bersifat permanen dan artikel akan dihapus secara permanen dari database.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="grid grid-cols-2 gap-2 mt-4">
          <Button 
            variant="outline" 
            class="rounded-xl font-bold border-slate-200 text-slate-800" 
            @click="showDeleteDialog = false"
          >
            Batal
          </Button>
          <Button 
            variant="destructive" 
            class="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2"
            @click="confirmDelete"
          >
            Ya, Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
article {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
h1 {
  font-family: Georgia, Cambria, "Times New Roman", Times, serif;
}
:deep(.text-justify) {
  text-align: justify;
}
:deep(.text-center) {
  text-align: center;
}
:deep(.text-left) {
  text-align: left;
}
</style>
