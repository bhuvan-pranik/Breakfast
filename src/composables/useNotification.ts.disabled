/**
 * useNotification Composable
 * 
 * Provides convenient notification/toast functionality.
 * Wraps the UI store and shadcn-vue toast system.
 */

import { useToast } from '@/components/ui/toast/use-toast'
import { useUIStore } from '@/stores/ui.store'
import type { ErrorHandlerResult } from '@/types/errors.types'

export interface NotificationOptions {
  title?: string
  description?: string
  duration?: number
  variant?: 'default' | 'destructive'
}

export function useNotification() {
  const { toast } = useToast()
  const uiStore = useUIStore()

  /**
   * Show success notification
   */
  function success(message: string, options?: NotificationOptions) {
    toast({
      title: options?.title || 'Success',
      description: message,
      duration: options?.duration || 3000,
      variant: 'default'
    })

    uiStore.showNotification({
      type: 'success',
      message,
      duration: options?.duration
    })
  }

  /**
   * Show error notification
   */
  function error(message: string, options?: NotificationOptions) {
    toast({
      title: options?.title || 'Error',
      description: message,
      duration: options?.duration || 5000,
      variant: 'destructive'
    })

    uiStore.showNotification({
      type: 'error',
      message,
      duration: options?.duration
    })
  }

  /**
   * Show warning notification
   */
  function warning(message: string, options?: NotificationOptions) {
    toast({
      title: options?.title || 'Warning',
      description: message,
      duration: options?.duration || 4000,
      variant: 'default'
    })

    uiStore.showNotification({
      type: 'warning',
      message,
      duration: options?.duration
    })
  }

  /**
   * Show info notification
   */
  function info(message: string, options?: NotificationOptions) {
    toast({
      title: options?.title || 'Info',
      description: message,
      duration: options?.duration || 3000,
      variant: 'default'
    })

    uiStore.showNotification({
      type: 'info',
      message,
      duration: options?.duration
    })
  }

  /**
   * Show notification from error handler result
   */
  function fromError(errorResult: ErrorHandlerResult, options?: NotificationOptions) {
    const variant = errorResult.severity === 'error' || errorResult.severity === 'critical'
      ? 'destructive'
      : 'default'

    toast({
      title: options?.title || errorResult.severity.charAt(0).toUpperCase() + errorResult.severity.slice(1),
      description: errorResult.userMessage,
      duration: options?.duration || 5000,
      variant
    })

    uiStore.showNotification({
      type: errorResult.severity === 'warning' ? 'warning' : 'error',
      message: errorResult.userMessage,
      duration: options?.duration
    })
  }

  /**
   * Clear all notifications
   */
  function clear() {
    uiStore.clearNotifications()
  }

  /**
   * Show loading notification (returns cleanup function)
   */
  function loading(message: string = 'Loading...') {
    const { dismiss } = toast({
      title: message,
      duration: Infinity,
      variant: 'default'
    })

    return dismiss
  }

  return {
    success,
    error,
    warning,
    info,
    fromError,
    clear,
    loading
  }
}
