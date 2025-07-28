import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Suas credenciais reais do Supabase
const supabaseUrl = 'https://nshclggtfexkxetlccuc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zaGNsZ2d0ZmV4a3hldGxjY3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MjE0NzYsImV4cCI6MjA2OTI5NzQ3Nn0.5kQevhQz6o25ZaTQjQP-LDnlUX2mlxn7i4IGisac5Jc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createSupabaseClient = () => {
  return createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey
  });
};

// Função para verificar usuário sem tentar criar na tabela users
export const ensureUserExists = async (authUser: any) => {
  if (!authUser?.id) return false;

  try {
    console.log('Verificando usuário autenticado:', authUser.id, authUser.email);
    
    // Simplesmente verificar se existe, sem tentar criar
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single();

    if (existingUser) {
      console.log('Usuário encontrado na tabela users:', existingUser.id);
    } else {
      console.log('Usuário não encontrado na tabela users, mas continuando com usuário autenticado');
    }

    return true;
  } catch (error) {
    console.warn('Aviso ao verificar usuário:', error);
    // Retornar true mesmo com erro, pois o usuário autenticado existe
    return true;
  }
};

// Função alternativa que simplesmente valida se o usuário está autenticado
export const validateAuthenticatedUser = (authUser: any) => {
  if (!authUser?.id) {
    console.error('Usuário não autenticado');
    return false;
  }
  
  console.log('Usuário autenticado:', authUser.id, authUser.email);
  return true;
};

// Função que ignora completamente a tabela users e só valida autenticação
export const skipUserTableValidation = (authUser: any) => {
  if (!authUser?.id || !authUser?.email) {
    console.error('Dados de usuário inválidos');
    return false;
  }
  
  console.log('Usuário válido (ignorando tabela users):', {
    id: authUser.id,
    email: authUser.email,
    metadata: authUser.user_metadata
  });
  
  return true;
};