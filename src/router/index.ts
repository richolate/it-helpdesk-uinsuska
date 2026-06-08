import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import RoleSelector from '../app/components/RoleSelector.vue'
import Login from '../app/components/Login.vue'

// Lazy-loaded portal components
const UserLayout = () => import('../app/components/user/UserLayout.vue')
const UserDashboard = () => import('../app/components/user/UserDashboard.vue')
const SubmitTicket = () => import('../app/components/user/SubmitTicket.vue')
const MyTickets = () => import('../app/components/user/MyTickets.vue')
const KnowledgeBase = () => import('../app/components/user/KnowledgeBase.vue')

const AdminLayout = () => import('../app/components/admin/AdminLayout.vue')
const AdminDashboard = () => import('../app/components/admin/AdminDashboard.vue')
const TicketManagement = () => import('../app/components/admin/TicketManagement.vue')
const KnowledgeManagement = () => import('../app/components/admin/KnowledgeManagement.vue')
const StaffPerformance = () => import('../app/components/admin/StaffPerformance.vue')
const StaffManagement = () => import('../app/components/admin/StaffManagement.vue')

const AdminSettings = () => import('../app/components/admin/AdminSettings.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: RoleSelector,
    },
    {
      path: '/login/:roleType',
      component: Login,
    },
    {
      path: '/user',
      component: UserLayout,
      meta: { requiresAuth: true, portalType: 'user' },
      children: [
        { path: '', component: UserDashboard },
        { path: 'submit-ticket', component: SubmitTicket },
        { path: 'my-tickets', component: MyTickets },
        { path: 'tickets', redirect: '/user/my-tickets' },
        { path: 'tickets/:id', component: () => import('../app/components/user/UserTicketDetail.vue') },
        { path: 'knowledge-base', component: KnowledgeBase },
        { path: 'knowledge/view/:id', component: () => import('../app/components/shared/KnowledgeReader.vue') },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, portalType: 'admin' },
      children: [
        { path: '', component: AdminDashboard },
        { path: 'tickets', component: TicketManagement },
        { path: 'tickets/:id', component: () => import('../app/components/admin/TicketDetail.vue') },
        { path: 'knowledge', component: KnowledgeManagement },
        { path: 'knowledge/editor/:id?', component: () => import('../app/components/admin/KnowledgeEditor.vue') },
        { path: 'knowledge/view/:id', component: () => import('../app/components/shared/KnowledgeReader.vue') },
        { path: 'performance', component: StaffPerformance },
        { path: 'staff', component: StaffManagement },
        { path: 'settings', component: AdminSettings },
      ],
    },
  ],
})

// Navigation guard
router.beforeEach((to) => {
  const auth = useAuth()
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

  if (!requiresAuth) return true

  const user = auth.getCurrentUser()

  // Not logged in at all → back to role selector
  if (!user) return '/'

  // Logged in but wrong portal (e.g. admin trying to access /user)
  const expectedPortal = to.matched.find((r) => r.meta.portalType)?.meta.portalType
  if (expectedPortal && user.portalType !== expectedPortal) {
    // Redirect to their correct portal
    return user.portalType === 'admin' ? '/admin' : '/user'
  }

  return true
})

export default router
