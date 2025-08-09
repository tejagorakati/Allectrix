'use client'

import { useState, useRef } from 'react'
import { 
  ShieldCheckIcon, 
  QrCodeIcon, 
  ExclamationTriangleIcon,
  HeartIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { parseHealthCardData } from '@/lib/qr'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'

interface EmergencyPatientData {
  name: string
  dateOfBirth: string
  bloodGroup?: string
  allergies?: string
  emergencyContact?: string
  profilePicture?: string
  healthCardId: string
}

export default function EmergencyAccess() {
  const [showScanner, setShowScanner] = useState(false)
  const [patientData, setPatientData] = useState<EmergencyPatientData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const startQRScanner = () => {
    setShowScanner(true)
    setError('')
    
    setTimeout(() => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }

      scannerRef.current = new Html5QrcodeScanner(
        'emergency-qr-reader',
        {
          fps: 10,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
        },
        false
      )

      scannerRef.current.render(
        async (decodedText) => {
          try {
            const qrData = parseHealthCardData(decodedText)
            if (qrData.healthCardId) {
              await fetchEmergencyData(qrData.healthCardId)
            } else {
              setError('Invalid QR code. Please scan a valid Arogya Card.')
            }
          } catch (error) {
            setError('Invalid QR code format.')
          }
          stopQRScanner()
        },
        (error) => {
          // Ignore scanning errors
        }
      )
    }, 100)
  }

  const stopQRScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setShowScanner(false)
  }

  const fetchEmergencyData = async (healthCardId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/emergency/access/${healthCardId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessorName: 'Emergency Personnel',
          accessMethod: 'qr_scan',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPatientData(data.patientData)
      } else {
        const error = await response.json()
        setError(error.message || 'Failed to access patient data')
      }
    } catch (error) {
      console.error('Error fetching emergency data:', error)
      setError('Failed to access patient data')
    } finally {
      setIsLoading(false)
    }
  }

  const resetView = () => {
    setPatientData(null)
    setError('')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Emergency Access</h1>
              <p className="text-red-100">Quick access to critical patient information</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {!patientData && !showScanner && (
            <div className="text-center py-12">
              <QrCodeIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Scan Patient's QR Code</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Scan the QR code on the patient's Arogya Card to access critical medical information
                for emergency treatment.
              </p>
              
              <button
                onClick={startQRScanner}
                className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-red-700 transition-colors"
              >
                Start Emergency Scan
              </button>

              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
                  <div className="text-left">
                    <h3 className="font-medium text-yellow-800">Emergency Use Only</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      This access is logged and monitored. Use only in genuine medical emergencies
                      when patient consent cannot be obtained.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showScanner && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Position QR Code in the Scanner</h2>
              <div id="emergency-qr-reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
              <button
                onClick={stopQRScanner}
                className="mt-4 bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel Scan
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Accessing patient information...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
                <div>
                  <h3 className="font-medium text-red-800">Access Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={resetView}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {patientData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900">Critical Patient Information</h2>
                <button
                  onClick={resetView}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  New Scan
                </button>
              </div>

              {/* Patient Identity */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <HeartIcon className="h-6 w-6 mr-2" />
                  Patient Identity
                </h3>
                
                <div className="flex items-center gap-6">
                  {patientData.profilePicture ? (
                    <Image
                      src={patientData.profilePicture}
                      alt={patientData.name}
                      width={100}
                      height={100}
                      className="rounded-full border-4 border-blue-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
                      <HeartIcon className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{patientData.name}</h4>
                    <p className="text-gray-600">DOB: {formatDate(new Date(patientData.dateOfBirth))}</p>
                    <p className="text-sm text-gray-500">Card ID: {patientData.healthCardId}</p>
                  </div>
                </div>
              </div>

              {/* Critical Medical Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blood Group */}
                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-red-900 mb-2">Blood Group</h3>
                  <p className="text-3xl font-bold text-red-600">
                    {patientData.bloodGroup || 'Not Specified'}
                  </p>
                </div>

                {/* Emergency Contact */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    Emergency Contact
                  </h3>
                  {patientData.emergencyContact ? (
                    <a
                      href={`tel:${patientData.emergencyContact}`}
                      className="text-2xl font-bold text-green-600 hover:text-green-800"
                    >
                      {patientData.emergencyContact}
                    </a>
                  ) : (
                    <p className="text-gray-500">Not provided</p>
                  )}
                </div>
              </div>

              {/* Allergies - Critical Alert */}
              {patientData.allergies && (
                <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                    ⚠️ ALLERGIES - CRITICAL ALERT
                  </h3>
                  <p className="text-orange-800 text-lg font-medium">{patientData.allergies}</p>
                </div>
              )}

              {!patientData.allergies && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-center">No known allergies on record</p>
                </div>
              )}

              {/* Emergency Protocol */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Protocol</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• This access has been logged with timestamp and location</li>
                  <li>• Patient will be notified of emergency access</li>
                  <li>• Full medical records require doctor authentication</li>
                  <li>• Document all treatment provided</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}