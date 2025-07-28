'use client';

import { useAuth } from '@/hooks/useAuth';
import UserAvatar, { ProfileDropdown } from './UserAvatar';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  showSearch?: boolean;
}

export default function PageHeader({ title, subtitle, children, showSearch = false }: PageHeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 w-64"
              />
            </div>
          )}

          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {user && (
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.user_metadata?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
              <ProfileDropdown user={user} onSignOut={signOut} />
            </div>
          )}
        </div>
      </div>

      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}