import Link from 'next/link'
import { HeartIcon, UserIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex justify-center items-center mb-6">
          <HeartIcon className="h-16 w-16 text-green-600 mr-4" />
          <h1 className="text-4xl font-bold text-gray-900">Arogya Card</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Secure Digital Health Management System for patients, doctors, and emergency services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {/* Patient Portal */}
        <Link href="/patient/register" className="group">
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center border-2 border-transparent group-hover:border-blue-200">
            <UserIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient Portal</h3>
            <p className="text-gray-600">Register and manage your health records</p>
          </div>
        </Link>

        {/* Doctor Portal */}
        <Link href="/doctor/login" className="group">
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center border-2 border-transparent group-hover:border-green-200">
            <UserGroupIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Portal</h3>
            <p className="text-gray-600">Access patient records and add diagnoses</p>
          </div>
        </Link>

        {/* Emergency Access */}
        <Link href="/emergency" className="group">
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center border-2 border-transparent group-hover:border-red-200">
            <ShieldCheckIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Emergency Access</h3>
            <p className="text-gray-600">Quick access to critical health information</p>
          </div>
        </Link>

        {/* Admin Portal */}
        <Link href="/admin/login" className="group">
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 text-center border-2 border-transparent group-hover:border-purple-200">
            <UserIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Portal</h3>
            <p className="text-gray-600">Manage users and system settings</p>
          </div>
        </Link>
      </div>

      <div className="mt-16 bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <HeartIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Secure Health Records</h3>
            <p className="text-gray-600 text-sm">Encrypted storage with blockchain audit trail</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <UserGroupIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Doctor Access</h3>
            <p className="text-gray-600 text-sm">Controlled access with full audit logging</p>
          </div>
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ShieldCheckIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="font-semibold mb-2">Emergency Ready</h3>
            <p className="text-gray-600 text-sm">Quick access to critical information</p>
          </div>
        </div>
      </div>
    </div>
  )
}
