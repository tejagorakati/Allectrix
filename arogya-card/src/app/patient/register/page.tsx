'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  emergencyContact: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
})

type PatientFormData = z.infer<typeof patientSchema>

export default function PatientRegister() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  })

  const onDropMedicalFiles = (acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles])
  }

  const onDropProfileImage = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setProfileImage(acceptedFiles[0])
    }
  }

  const { getRootProps: getMedicalRootProps, getInputProps: getMedicalInputProps, isDragActive: isMedicalDragActive } = useDropzone({
    onDrop: onDropMedicalFiles,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const { getRootProps: getProfileRootProps, getInputProps: getProfileInputProps, isDragActive: isProfileDragActive } = useDropzone({
    onDrop: onDropProfileImage,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      if (profileImage) {
        formData.append('profileImage', profileImage)
      }

      uploadedFiles.forEach((file, index) => {
        formData.append(`medicalFile_${index}`, file)
      })

      const response = await fetch('/api/patient/register', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/patient/card/${result.healthCardId}`)
      } else {
        const error = await response.json()
        alert(error.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <UserIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Patient Registration</h1>
          <p className="text-gray-600 mt-2">Create your digital health card</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                {...register('name')}
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                {...register('email')}
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="+91 XXXXX XXXXX"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth *
              </label>
              <input
                {...register('dateOfBirth')}
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              />
              {errors.dateOfBirth && <p className="text-red-600 text-sm mt-1">{errors.dateOfBirth.message}</p>}
            </div>
          </div>

          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture (Optional)
            </label>
            <div
              {...getProfileRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isProfileDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getProfileInputProps()} />
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {profileImage ? (
                <div>
                  <p className="text-green-600 font-medium">{profileImage.name}</p>
                  <p className="text-sm text-gray-500">Click to replace</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">Drop your profile picture here, or click to select</p>
                  <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                Blood Group
              </label>
              <select
                {...register('bloodGroup')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                Emergency Contact
              </label>
              <input
                {...register('emergencyContact')}
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="Emergency contact number"
              />
            </div>
          </div>

          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
              Allergies
            </label>
            <textarea
              {...register('allergies')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              placeholder="List any known allergies"
            />
          </div>

          <div>
            <label htmlFor="chronicDiseases" className="block text-sm font-medium text-gray-700">
              Chronic Diseases
            </label>
            <textarea
              {...register('chronicDiseases')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              placeholder="List any chronic conditions"
            />
          </div>

          {/* Medical Records Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Medical Records (Optional)
            </label>
            <div
              {...getMedicalRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isMedicalDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getMedicalInputProps()} />
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Drop your medical files here, or click to select</p>
              <p className="text-sm text-gray-500">PDF, Images, Text files up to 10MB each</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-gray-700">Uploaded Files:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Creating Health Card...' : 'Create Health Card'}
            </button>
            <Link
              href="/"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}