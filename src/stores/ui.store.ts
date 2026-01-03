/**
 * UI Store
 * Manages UI state (notifications, modals, global loading)
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Notification, ModalState, ConfirmDialogOptions } from '@/types'
import { generateId } from '@/utils/helpers'
import { NOTIFICATION_DURATION } from '@/utils/constants'

export const useUIStore = defineStore('ui', () => {
  // ============================================================================
  // STATE
  // ============================================================================
  const notifications = ref<Notification[]>([])
  const isGlobalLoading = ref(false)
  const activeModal = ref<ModalState>({
    isOpen: false,
    component: null,
    props: {}
  })

  const confirmDialog = ref<{
    isOpen: boolean
    options: ConfirmDialogOptions | null
    resolve: ((value: boolean) => void) | null
  }>({
    isOpen: false,
    options: null,
    resolve: null
  })

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Show notification
   */
  function showNotification(
    message: string,
    type: Notification['type'] = 'info',
    duration?: number
  ): void {
    const id = generateId()
    const notificationDuration = duration || NOTIFICATION_DURATION[type.toUpperCase() as keyof typeof NOTIFICATION_DURATION]

    const notification: Notification = {
      id,
      type,
      message,
      duration: notificationDuration
    }

    notifications.value.push(notification)

    // Auto-remove after duration
    if (notificationDuration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notificationDuration)
    }
  }

  /**
   * Show success notification
   */
  function showSuccess(message: string, duration?: number): void {
    showNotification(message, 'success', duration)
  }

  /**
   * Show error notification
   */
  function showError(message: string, duration?: number): void {
    showNotification(message, 'error', duration)
  }

  /**
   * Show warning notification
   */
  function showWarning(message: string, duration?: number): void {
    showNotification(message, 'warning', duration)
  }

  /**
   * Show info notification
   */
  function showInfo(message: string, duration?: number): void {
    showNotification(message, 'info', duration)
  }

  /**
   * Remove notification
   */
  function removeNotification(id: string): void {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  /**
   * Clear all notifications
   */
  function clearNotifications(): void {
    notifications.value = []
  }

  /**
   * Open modal
   */
  function openModal(component: string, props?: Record<string, any>): void {
    activeModal.value = {
      isOpen: true,
      component,
      props: props || {}
    }
  }

  /**
   * Close modal
   */
  function closeModal(): void {
    activeModal.value = {
      isOpen: false,
      component: null,
      props: {}
    }
  }

  /**
   * Show confirm dialog
   */
  function confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise(resolve => {
      confirmDialog.value = {
        isOpen: true,
        options,
        resolve
      }
    })
  }

  /**
   * Resolve confirm dialog
   */
  function resolveConfirm(value: boolean): void {
    if (confirmDialog.value.resolve) {
      confirmDialog.value.resolve(value)
    }
    confirmDialog.value = {
      isOpen: false,
      options: null,
      resolve: null
    }
  }

  /**
   * Set global loading state
   */
  function setGlobalLoading(loading: boolean): void {
    isGlobalLoading.value = loading
  }

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // State
    notifications,
    isGlobalLoading,
    activeModal,
    confirmDialog,

    // Actions
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
    confirm,
    resolveConfirm,
    setGlobalLoading
  }
})
