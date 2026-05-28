import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AppNotification {
  id: string
  title: string
  message: string
  time: Date
  isRead: boolean
  type: 'info' | 'success' | 'warning' | 'error'
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<AppNotification[]>([])
  
  // Track the most recently added notification for Toast display
  const latestNotification = ref<AppNotification | null>(null)

  function addNotification(notif: Omit<AppNotification, 'id' | 'time' | 'isRead'>) {
    const newNotif: AppNotification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      time: new Date(),
      isRead: false
    }
    
    // Add to the top of the history
    notifications.value.unshift(newNotif)
    
    // Set as latest to trigger the toast
    latestNotification.value = newNotif
    
    // Automatically clear the latest notification after 5 seconds to hide toast
    setTimeout(() => {
      if (latestNotification.value?.id === newNotif.id) {
        latestNotification.value = null
      }
    }, 5000)
  }

  function markAsRead(id: string) {
    const notif = notifications.value.find(n => n.id === id)
    if (notif) {
      notif.isRead = true
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => { n.isRead = true })
  }
  
  function clearToast() {
    latestNotification.value = null
  }

  return {
    notifications,
    latestNotification,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearToast
  }
})
