/**
 * QR Code Service
 * Handles QR code generation and validation
 */

import { SHA256 } from 'crypto-js'
import QRCode from 'qrcode'
import { getActiveQrSalt } from '@/config/env'

class QRCodeService {
  private readonly salt: string

  constructor() {
    this.salt = getActiveQrSalt()

    if (!this.salt) {
      throw new Error('QR_SALT environment variable is not defined')
    }
  }

  /**
   * Generate QR code string for employee
   * Format: SHA256(phone + name + salt)
   */
  generateQRCode(phone: string, name: string): string {
    // Normalize inputs
    const normalizedPhone = phone.trim()
    const normalizedName = name.trim().toLowerCase()

    // Create hash input
    const input = `${normalizedPhone}${normalizedName}${this.salt}`

    // Generate SHA-256 hash
    const hash = SHA256(input).toString()

    return hash
  }

  /**
   * Validate QR code against employee data
   */
  validateQRCode(qrCode: string, phone: string, name: string): boolean {
    const expectedQRCode = this.generateQRCode(phone, name)
    return qrCode === expectedQRCode
  }

  /**
   * Parse QR code data
   */
  parseQRCode(qrCode: string): { hash: string } {
    return { hash: qrCode }
  }

  /**
   * Generate QR code image data URL
   * Uses qrcode library to create visual QR code
   */
  async generateQRCodeImage(
    qrCode: string,
    options?: {
      width?: number
      margin?: number
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
    }
  ): Promise<string> {
    const defaultOptions = {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M' as const,
      ...options
    }

    try {
      const dataUrl = await QRCode.toDataURL(qrCode, defaultOptions)
      return dataUrl
    } catch (error) {
      throw new Error('Failed to generate QR code image')
    }
  }

  /**
   * Download QR code as image
   */
  async downloadQRCode(
    qrCode: string,
    filename: string,
    options?: Parameters<typeof this.generateQRCodeImage>[1]
  ): Promise<void> {
    const dataUrl = await this.generateQRCodeImage(qrCode, options)

    // Create download link
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${filename}.png`
    link.click()
  }
}

export const qrcodeService = new QRCodeService()
