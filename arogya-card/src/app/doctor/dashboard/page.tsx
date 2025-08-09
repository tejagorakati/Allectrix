'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  QrCodeIcon, 
  MagnifyingGlassIcon, 
  UserIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { parseHealthCardData } from '@/lib/qr'

interface Doctor {
  id: string
  name: string
  email: string
  licenseNumber: string
  specialization: string
}

interface RecentAccess {
  id: string
  patientName: string
  healthCardId: string
  accessTime: string
  accessType: string
}

export default function DoctorDashboard() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentAccess, setRecentAccess] = useState<RecentAccess[]>([])
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    checkAuthentication()
    fetchRecentAccess()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthentication = async () => {
    const token = localStorage.getItem('doctorToken')
    if (!token) {
      router.push('/doctor/login')
      return
    }

    try {
      const response = await fetch('/api/doctor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDoctor(data.doctor)
      } else {
        localStorage.removeItem('doctorToken')
        router.push('/doctor/login')
      }
         } catch (err) {
       console.error('Auth check error:', err)
       router.push('/doctor/login')
     } finally {
      setIsLoading(false)
    }
  }

  const fetchRecentAccess = async () => {
    const token = localStorage.getItem('doctorToken')
    if (!token) return

    try {
      const response = await fetch('/api/doctor/recent-access', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRecentAccess(data.recentAccess)
      }
           } catch (err) {
         console.error('Error fetching recent access:', err)
       }
  }

  const startQRScanner = () => {
    setShowScanner(true)
    setTimeout(() => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }

      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      )

      scannerRef.current.render(
        (decodedText) => {
          try {
            const qrData = parseHealthCardData(decodedText)
            if (qrData.healthCardId) {
              router.push(`/doctor/patient/${qrData.healthCardId}`)
            } else {
              alert('Invalid QR code. Please scan a valid Arogya Card.')
            }
                                  } catch {
             alert('Invalid QR code format.')
           }
          stopQRScanner()
        },
                 () => {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/doctor/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('doctorToken')
    router.push('/doctor/login')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, Dr. {doctor.name}</h1>
            <p className="text-gray-600">{doctor.specialization} • License: {doctor.licenseNumber}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* QR Scanner */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <QrCodeIcon className="h-6 w-6 mr-2" />
            QR Code Scanner
          </h2>
          
          {!showScanner ? (
            <div className="text-center py-8">
              <QrCodeIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Scan patient&apos;s QR code for quick access</p>
              <button
                onClick={startQRScanner}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Start Scanning
              </button>
            </div>
          ) : (
            <div>
              <div id="qr-reader" style={{ width: '100%' }}></div>
              <button
                onClick={stopQRScanner}
                className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Stop Scanner
              </button>
            </div>
          )}
        </div>

        {/* Manual Search */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MagnifyingGlassIcon className="h-6 w-6 mr-2" />
            Patient Search
          </h2>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search by Health Card ID, Name, or Phone
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
                placeholder="Enter Health Card ID or patient details"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Search Patient
            </button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium text-gray-900 mb-2">Quick Tips:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use QR scanner for fastest access</li>
              <li>• All patient interactions are logged</li>
              <li>• Emergency info is always accessible</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Patient Access */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <ClockIcon className="h-6 w-6 mr-2" />
          Recent Patient Access
        </h2>

        {recentAccess.length > 0 ? (
          <div className="space-y-4">
            {recentAccess.map((access) => (
              <div key={access.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{access.patientName}</p>
                    <p className="text-sm text-gray-600">Card ID: {access.healthCardId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{access.accessType}</p>
                  <p className="text-xs text-gray-500">{access.accessTime}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No recent patient access</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-blue-600">24</h3>
          <p className="text-blue-800">Patients Accessed Today</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-green-600">156</h3>
          <p className="text-green-800">Total Patients This Month</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-purple-600">89</h3>
          <p className="text-purple-800">Records Added</p>
        </div>
      </div>
    </div>
  )
}