'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { 
  UserIcon, 
  ShieldExclamationIcon, 
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  healthCardId: string
  qrCodeData: string
  profilePicture?: string
  emergencyContact?: string
  bloodGroup?: string
  allergies?: string
  chronicDiseases?: string
  isCardBlocked: boolean
  createdAt: string
}

export default function HealthCard() {
  const params = useParams()
  const healthCardId = params.healthCardId as string
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)

  const fetchPatientData = useCallback(async () => {
    try {
      const response = await fetch(`/api/patient/card/${healthCardId}`)
      if (response.ok) {
        const data = await response.json()
        setPatient(data.patient)
      } else {
        const error = await response.json()
        setError(error.message || 'Failed to load health card')
      }
    } catch (error) {
      console.error('Error fetching patient data:', error)
      setError('Failed to load health card')
    } finally {
      setLoading(false)
    }
  }, [healthCardId])

  useEffect(() => {
    fetchPatientData()
  }, [fetchPatientData])

  const handleBlockCard = async () => {
    if (!window.confirm('Are you sure you want to block this health card? This action will prevent all access to your medical records.')) {
      return
    }

    setIsBlocking(true)
    try {
      const response = await fetch(`/api/patient/card/${healthCardId}/block`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchPatientData() // Refresh data
        alert('Health card blocked successfully')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to block card')
      }
    } catch (error) {
      console.error('Error blocking card:', error)
      alert('Failed to block card')
    } finally {
      setIsBlocking(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your health card...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <UserIcon className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Card Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Card Status Alert */}
        {patient.isCardBlocked && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ShieldExclamationIcon className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Card Blocked</h3>
                <p className="text-red-700">This health card has been blocked and cannot be used for medical access.</p>
              </div>
            </div>
          </div>
        )}

        {/* Digital Health Card */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">AROGYA CARD</h1>
              <p className="text-blue-100">Digital Health Identity</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Card ID</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-mono">{patient.healthCardId}</p>
                <button
                  onClick={() => copyToClipboard(patient.healthCardId)}
                  className="p-1 hover:bg-white/20 rounded"
                  title="Copy Card ID"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                {patient.profilePicture ? (
                  <Image
                    src={patient.profilePicture}
                    alt={patient.name}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-white/20"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <UserIcon className="h-10 w-10 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{patient.name}</h2>
                  <p className="text-blue-100">DOB: {formatDate(new Date(patient.dateOfBirth))}</p>
                  {patient.bloodGroup && (
                    <p className="text-blue-100">Blood Group: <span className="font-semibold">{patient.bloodGroup}</span></p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-100">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
                <div>
                  <p className="text-blue-100">Phone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
                {patient.emergencyContact && (
                  <div>
                    <p className="text-blue-100">Emergency Contact</p>
                    <p className="font-medium">{patient.emergencyContact}</p>
                  </div>
                )}
                <div>
                  <p className="text-blue-100">Registered</p>
                  <p className="font-medium">{formatDate(new Date(patient.createdAt))}</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg">
                <Image
                  src={patient.qrCodeData}
                  alt="Health Card QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm text-blue-100 mt-2">
                Scan for emergency access
              </p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Medical Information</h3>
            <button
              onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              {showSensitiveInfo ? (
                <>
                  <EyeSlashIcon className="h-5 w-5" />
                  Hide Details
                </>
              ) : (
                <>
                  <EyeIcon className="h-5 w-5" />
                  Show Details
                </>
              )}
            </button>
          </div>

          {showSensitiveInfo ? (
            <div className="space-y-4">
              {patient.allergies && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Allergies</h4>
                  <p className="text-gray-700 bg-red-50 p-3 rounded-lg">{patient.allergies}</p>
                </div>
              )}

              {patient.chronicDiseases && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Chronic Diseases</h4>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{patient.chronicDiseases}</p>
                </div>
              )}

              {!patient.allergies && !patient.chronicDiseases && (
                <p className="text-gray-500 italic">No medical conditions recorded</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Click &quot;Show Details&quot; to view sensitive medical information</p>
          )}
        </div>

        {/* Card Management */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Card Management</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/patient/dashboard/${patient.id}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              View Full Dashboard
            </Link>
            
            <Link
              href={`/patient/records/${patient.id}`}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Medical Records
            </Link>

            {!patient.isCardBlocked && (
              <button
                onClick={handleBlockCard}
                disabled={isBlocking}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <ShieldExclamationIcon className="h-5 w-5" />
                {isBlocking ? 'Blocking...' : 'Block Card'}
              </button>
            )}

            <button
              onClick={() => copyToClipboard(window.location.href)}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              <DocumentDuplicateIcon className="h-5 w-5" />
              Share Card
            </button>
          </div>
        </div>

        {/* Emergency Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">Emergency Access Instructions</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• Medical professionals can scan the QR code for emergency access</li>
            <li>• Emergency access provides critical information only (allergies, blood group, emergency contact)</li>
            <li>• All access attempts are logged and you will be notified</li>
            <li>• Block your card immediately if lost or stolen</li>
          </ul>
        </div>
      </div>
    </div>
  )
}