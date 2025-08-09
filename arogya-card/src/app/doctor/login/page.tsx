'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserGroupIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const doctorLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  licenseNumber: z.string().min(1, 'License number is required'),
})

type DoctorLoginData = z.infer<typeof doctorLoginSchema>

export default function DoctorLogin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorLoginData>({
    resolver: zodResolver(doctorLoginSchema),
  })

  const onSubmit = async (data: DoctorLoginData) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/doctor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        // Store token in localStorage (in production, use secure httpOnly cookies)
        localStorage.setItem('doctorToken', result.token)
        router.push('/doctor/dashboard')
      } else {
        const error = await response.json()
        setError(error.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <UserGroupIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Doctor Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to access patient records</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
              placeholder="doctor@hospital.com"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
              Medical License Number
            </label>
            <input
              {...register('licenseNumber')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
              placeholder="Enter your license number"
            />
            {errors.licenseNumber && <p className="text-red-600 text-sm mt-1">{errors.licenseNumber.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 border"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="text-green-600 hover:text-green-500">
                Forgot password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                <LockClosedIcon className="h-4 w-4 mr-2" />
                Sign In
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Not registered as a doctor?{' '}
              <Link href="/doctor/register" className="text-green-600 hover:text-green-500">
                Apply for access
              </Link>
            </p>
          </div>

          <div className="border-t pt-6">
            <Link
              href="/"
              className="w-full block text-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Home
            </Link>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">For Medical Professionals</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Access patient records securely with proper authentication</li>
          <li>• All access attempts are logged and audited</li>
          <li>• Use QR code scanner for quick patient lookup</li>
          <li>• Add diagnoses and prescriptions with digital signatures</li>
        </ul>
      </div>
    </div>
  )
}