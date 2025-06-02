export interface Project {
  id: string;
  name: string;
  slug: string;
  is_weekly_priority?: boolean;
}

export type FeatureStatus = 'not_prioritized' | 'prioritized' | 'in_progress' | 'done' | 'in_production';

export type TeamRole = 'responsible' | 'accountable' | 'consulted' | 'informed';

export interface TeamRaci {
  team: string;
  role: TeamRole;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  project_id: string;
  created_by: string;
  votes_count: number;
  created_at: string;
  status: FeatureStatus;
  deadline?: string;
  raci: TeamRaci[];
  project?: Project;
  voters?: { user_id: string }[];
}

export interface Vote {
  id: string;
  feature_id: string;
  user_id: string;
  created_at: string;
  user?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface AuthFormData {
  email: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export const TEAMS = [
  'Comunicação & Marketing',
  'Produtos Digitais & Tecnologia',
  'Gestão Fórum',
  'Ops Eventos',
  'Montagem eventos',
  'Financeiro',
  'RH',
  'CS',
  'Curadoria'
] as const;

export type Team = typeof TEAMS[number];