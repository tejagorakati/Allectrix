import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return qrCodeDataURL
  } catch (err) {
    console.error('Error generating QR code:', err)
    throw new Error('Failed to generate QR code')
  }
}

export function parseHealthCardData(qrData: string) {
  try {
    return JSON.parse(qrData)
  } catch {
    // If it's not JSON, treat it as a simple health card ID
    return { healthCardId: qrData }
  }
}