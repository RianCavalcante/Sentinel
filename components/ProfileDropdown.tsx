import React, { useState, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { UserProfile } from '../hooks/useProfile';

interface ProfileDropdownProps {
  user: User;
  profile: UserProfile | null;
  onSignOut: () => void;
  onOpenProfile: () => void;
}

export function ProfileDropdown({ user, profile, onSignOut, onOpenProfile }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Usuário';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-white/10">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={16} className="text-zinc-400" />
          )}
        </div>

        {/* Nome (desktop) */}
        <span className="hidden md:inline text-sm text-zinc-300">{displayName}</span>
        
        {/* Chevron */}
        <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header do menu */}
          <div className="px-4 py-3 border-b border-white/5 bg-zinc-900/50">
            <p className="text-sm font-medium text-zinc-200 truncate">{displayName}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>

          {/* Opções */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenProfile();
              }}
              className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 transition-colors flex items-center gap-3"
            >
              <UserIcon size={16} className="text-zinc-500" />
              Editar Perfil
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // Futura página de configurações
              }}
              className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 transition-colors flex items-center gap-3"
            >
              <Settings size={16} className="text-zinc-500" />
              Configurações
            </button>

            <div className="border-t border-white/5 my-1" />

            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
