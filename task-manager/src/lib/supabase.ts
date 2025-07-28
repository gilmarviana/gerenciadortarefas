import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas do banco de dados
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  created_at: string
}

export interface TaskStatus {
  id: string
  name: string
  color: string
  order: number
  project_id: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status_id: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  type: 'feature' | 'bug' | 'improvement' | 'task'
  assigned_to?: string
  project_id: string
  parent_task_id?: string
  start_date?: string
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  order: number
  created_at: string
  updated_at: string
}

export interface TimeEntry {
  id: string
  task_id: string
  user_id: string
  start_time: string
  end_time?: string
  description?: string
  created_at: string
}

export interface Flowchart {
  id: string
  name: string
  description?: string
  data: Record<string, unknown>
  project_id: string
  created_at: string
  updated_at: string
}