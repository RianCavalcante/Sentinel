import { supabase } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Faz login com email e senha
 */
export async function signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return {
    user: data.user,
    error
  };
}

/**
 * Registra novo usuário
 */
export async function signUp(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  return {
    user: data.user,
    error
  };
}

/**
 * Faz logout
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Obtém usuário atual
 */
export async function getUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Obtém sessão atual
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Envia email de reset de senha
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  return { error };
}

/**
 * Atualiza senha do usuário
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  return { error };
}

/**
 * Verifica se usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
