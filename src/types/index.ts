export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  client?: Client;
}

export interface TaskColumn {
  id: string;
  name: string;
  color: string;
  position: number;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  column_id: string;
  category_id?: string;
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  type: 'task' | 'bug' | 'feature' | 'improvement';
  start_date?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  position: number;
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  project?: Project;
  column?: TaskColumn;
  category?: TaskCategory;
  assigned_user?: User;
  subtasks?: Task[];
  time_entries?: TimeEntry[];
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  description?: string;
  created_at: string;
  updated_at: string;
  task?: Task;
  user?: User;
}

export interface FlowchartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end';
  label: string;
  position: { x: number; y: number };
  data: any;
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Flowchart {
  id: string;
  name: string;
  description?: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  project_id?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TaskFilter {
  status?: string[];
  priority?: string[];
  type?: string[];
  assigned_to?: string[];
  category?: string[];
  start_date?: string;
  end_date?: string;
  project_id?: string;
  search?: string;
}

export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  total_projects: number;
  active_projects: number;
  total_clients: number;
  total_time_tracked: number;
}

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string[];
  type: 'task' | 'milestone' | 'project';
  assignee?: string;
}