import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Perfil não existe, criar um novo
        await createProfile();
      } else if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: null
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    setUploading(true);
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      // Validar tamanho (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Imagem deve ter no máximo 2MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload para storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar perfil com nova URL
      await updateProfile({ avatar_url: publicUrl });

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      return { success: false, error: error.message };
    } finally {
      setUploading(false);
    }
  };

  return {
    profile,
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
    refreshProfile: fetchProfile
  };
}
