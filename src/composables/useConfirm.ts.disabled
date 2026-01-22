/**
 * useConfirm Composable
 * 
 * Provides confirmation dialog functionality.
 * Wraps the UI store confirm dialog.
 */

import { useUIStore } from '@/stores/ui.store'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function useConfirm() {
  const uiStore = useUIStore()

  /**
   * Show confirmation dialog and wait for user response
   */
  async function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      uiStore.showConfirm({
        title: options.title || 'Confirm',
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        onConfirm: () => {
          uiStore.hideConfirm()
          resolve(true)
        },
        onCancel: () => {
          uiStore.hideConfirm()
          resolve(false)
        }
      })
    })
  }

  /**
   * Show delete confirmation
   */
  async function confirmDelete(itemName: string = 'this item'): Promise<boolean> {
    return confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    })
  }

  /**
   * Show discard changes confirmation
   */
  async function confirmDiscard(): Promise<boolean> {
    return confirm({
      title: 'Discard Changes',
      message: 'You have unsaved changes. Are you sure you want to discard them?',
      confirmText: 'Discard',
      cancelText: 'Keep Editing',
      variant: 'destructive'
    })
  }

  /**
   * Show logout confirmation
   */
  async function confirmLogout(): Promise<boolean> {
    return confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel'
    })
  }

  return {
    confirm,
    confirmDelete,
    confirmDiscard,
    confirmLogout
  }
}
