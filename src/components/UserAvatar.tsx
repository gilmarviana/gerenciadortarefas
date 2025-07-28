'use client';

import { useState } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { UserIcon, CameraIcon } from '@heroicons/react/24/outline';

interface UserAvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUpload?: boolean;
  onImageUpload?: (file: File) => void;
  className?: string;
}

export default function UserAvatar({ 
  user, 
  size = 'md', 
  showUpload = false, 
  onImageUpload,
  className = '' 
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  const getAvatarColors = (str: string) => {
    // Generate consistent colors based on string
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-cyan-500'
    ];
    
    const hash = str.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name;
  const email = user?.email;
  
  const initials = getInitials(fullName, email);
  const colorClass = getAvatarColors(email || fullName || 'user');

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`
        ${sizeClasses[size]} 
        rounded-full 
        overflow-hidden 
        flex 
        items-center 
        justify-center 
        font-semibold 
        text-white
        border-2 
        border-white 
        shadow-sm
        ${!avatarUrl || imageError ? colorClass : 'bg-gray-200'}
      `}>
        {avatarUrl && !imageError ? (
          <img
            src={avatarUrl}
            alt={`${fullName || email} avatar`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="select-none">
            {initials}
          </span>
        )}
      </div>

      {showUpload && (
        <label className="absolute -bottom-1 -right-1 cursor-pointer">
          <div className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-1 shadow-lg transition-colors">
            <CameraIcon className="w-3 h-3" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}

// Logo do sistema para usar quando não há usuário
export function SystemLogo({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Fundo circular com gradiente */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" filter="url(#shadow)" />
        
        {/* Símbolo de tarefa/checklist estilizado */}
        <g fill="white">
          {/* Primeiro item da lista */}
          <circle cx="25" cy="30" r="3" />
          <rect x="35" y="28" width="35" height="4" rx="2" />
          
          {/* Segundo item da lista */}
          <circle cx="25" cy="45" r="3" />
          <rect x="35" y="43" width="25" height="4" rx="2" />
          
          {/* Terceiro item da lista (checked) */}
          <circle cx="25" cy="60" r="3" fill="#10b981" />
          <path d="M22 60 L24 62 L28 58" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="35" y="58" width="30" height="4" rx="2" opacity="0.7" />
          
          {/* Quarto item da lista */}
          <circle cx="25" cy="75" r="3" />
          <rect x="35" y="73" width="20" height="4" rx="2" />
        </g>
      </svg>
    </div>
  );
}

// Componente para dropdown do perfil
export function ProfileDropdown({ user, onSignOut }: { user: User | null, onSignOut: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <UserAvatar user={user} size="sm" />
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium text-gray-900">
            {user.user_metadata?.full_name || 'Usuário'}
          </p>
          <p className="text-xs text-gray-500">
            {user.email}
          </p>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.user_metadata?.full_name || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500">
                {user.email}
              </p>
            </div>
            
            <button
              onClick={() => {
                setIsOpen(false);
                // Aqui você pode adicionar navegação para perfil
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Meu Perfil
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                // Aqui você pode adicionar navegação para configurações
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Configurações
            </button>
            
            <hr className="my-1" />
            
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}