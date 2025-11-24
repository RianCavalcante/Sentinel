import React, { useState, useRef } from 'react';
import { X, Upload, User as UserIcon, Loader } from 'lucide-react';
import { UserProfile } from '../hooks/useProfile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  uploading: boolean;
  onUploadAvatar: (file: File) => Promise<any>;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<any>;
}

export function ProfileModal({ 
  isOpen, 
  onClose, 
  profile, 
  uploading,
  onUploadAvatar,
  onUpdateProfile 
}: ProfileModalProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    const result = await onUploadAvatar(file);
    if (!result.success) {
      alert(`Erro ao fazer upload: ${result.error}`);
      setPreviewUrl(null);
    }
  };

  const handleSave = async () => {
    if (fullName !== profile?.full_name) {
      await onUpdateProfile({ full_name: fullName });
    }
    onClose();
  };

  const currentAvatarUrl = previewUrl || profile?.avatar_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <h2 className="text-lg font-semibold text-zinc-100">Editar Perfil</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center overflow-hidden ring-4 ring-white/10">
                {currentAvatarUrl ? (
                  <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={32} className="text-zinc-400" />
                )}
              </div>
              
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploading ? (
                  <Loader size={20} className="text-white animate-spin" />
                ) : (
                  <Upload size={20} className="text-white" />
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <p className="text-xs text-zinc-500 text-center">
              Clique na imagem para alterar<br />
              <span className="text-[10px]">PNG, JPG ou WebP (máx. 2MB)</span>
            </p>
          </div>

          {/* Nome completo */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-800 transition-all"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-zinc-900/30 border border-white/5 rounded-lg text-zinc-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex gap-3 justify-end bg-zinc-900/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
