import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ListChecks, Clock, CheckCircle2, Star, ThumbsUp, User, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSession } from '@supabase/auth-helpers-react';
import type { Project, Feature } from '../types';
import { toast } from 'react-hot-toast';
import { ResponsibleTeams } from '../components/ResponsibleTeams';

interface ProjectStats {
  total: number;
  inProgress: number;
  completed: number;
}

interface UserMetadata {
  first_name?: string;
  last_name?: string;
}

const statusColors = {
  not_prioritized: 'bg-gray-100 text-gray-700',
  prioritized: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
  in_production: 'bg-purple-100 text-purple-700',
};

const statusLabels = {
  not_prioritized: 'Não Priorizado',
  prioritized: 'Priorizado',
  in_progress: 'Em andamento',
  done: 'Validando',
  in_production: 'Finalizado',
};

export function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [features, setFeatures] = useState<(Feature & { project?: Project; creator?: UserMetadata; voters?: {user_metadata: UserMetadata}[] })[]>([]);
  const [projectStats, setProjectStats] = useState<Record<string, ProjectStats>>({});
  const [viewMode, setViewMode] = useState<'projects' | 'ideas'>('projects');
  const navigate = useNavigate();
  const session = useSession();

  const isAdmin = session?.user?.email === 'tiago.rosa@ecommercebrasil.com.br';

  useEffect(() => {
    fetchProjects();
    fetchAllFeatures();
  }, []);

  const fetchProjects = async () => {
    const { data: projectsData } = await supabase.from('projects').select('*');
    if (projectsData) {
      setProjects(projectsData);
      
      const { data: featuresData } = await supabase
        .from('features')
        .select('*');
        
      if (featuresData) {
        const stats: Record<string, ProjectStats> = {};
        
        projectsData.forEach((project: any) => {
          const projectFeatures = featuresData.filter(f => f.project_id === project.id);
          stats[project.id] = {
            total: projectFeatures.length,
            inProgress: projectFeatures.filter(f => f.status === 'in_progress').length,
            completed: projectFeatures.filter(f => ['done', 'in_production'].includes(f.status)).length
          };
        });
        
        setProjectStats(stats);
      }
    }
  };

  const fetchAllFeatures = async () => {
    const { data } = await supabase
      .from('features')
      .select(`
        *,
        project:projects(*),
        votes(
          id,
          user_id,
          user:users(raw_user_meta_data)
        ),
        creator:users(raw_user_meta_data)
      `)
      .order('votes_count', { ascending: false });

    if (data) {
      const featuresWithMetadata = data.map(feature => ({
        ...feature,
        creator: feature.creator?.raw_user_meta_data,
        voters: feature.votes?.map(vote => ({
          user_metadata: vote.user?.raw_user_meta_data || {}
        })) || []
      }));
      setFeatures(featuresWithMetadata);
    }
  };

  const togglePriority = async (projectId: string, currentPriority: boolean) => {
    const { error } = await supabase
      .from('projects')
      .update({ is_weekly_priority: !currentPriority })
      .eq('id', projectId);

    if (error) {
      toast.error('Erro ao atualizar prioridade');
    } else {
      toast.success('Prioridade atualizada com sucesso');
      fetchProjects();
    }
  };

  const ProjectCard = ({ project, index }: { project: Project; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {project.name}
            </h2>
            {project.is_weekly_priority && (
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePriority(project.id, !!project.is_weekly_priority);
                }}
                className={`p-2 rounded-full transition-colors ${
                  project.is_weekly_priority 
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star className={`h-5 w-5 ${project.is_weekly_priority ? 'fill-yellow-500' : ''}`} />
              </motion.button>
            )}
            <motion.div
              whileHover={{ x: 5 }}
              className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <ArrowRight size={24} />
            </motion.div>
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          Veja e vote nas demandas propostas para {project.name}
        </p>
        
        {projectStats[project.id] && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <ListChecks size={16} />
                <span className="text-sm">Total</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                {projectStats[project.id].total}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-yellow-600 mb-1">
                <Clock size={16} />
                <span className="text-sm">Em Progresso</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-yellow-600">
                {projectStats[project.id].inProgress}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-green-600 mb-1">
                <CheckCircle2 size={16} />
                <span className="text-sm">Concluídas</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                {projectStats[project.id].completed}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const priorityProjects = projects.filter(p => p.is_weekly_priority);
  const otherProjects = projects.filter(p => !p.is_weekly_priority);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex justify-center mb-6"
          >
            <Sparkles className="h-12 sm:h-16 w-12 sm:w-16 text-blue-600" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Sistema de priorização de demandas
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Escolha um projeto para ver, votar e criar demandas.
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewMode('projects')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'projects'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ver Projetos
          </button>
          <button
            onClick={() => setViewMode('ideas')}
            className={`px-4 py-2 rounded-md transition-colors ${
              viewMode === 'ideas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Ver Todas as Ideias
          </button>
        </div>

        {viewMode === 'projects' ? (
          <>
            {priorityProjects.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Prioridades da Semana</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {priorityProjects.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Todos os Projetos</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {otherProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/project/${feature.project_id}`)}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer p-6"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <User className="w-4 h-4" />
                  <span>
                    {feature.creator?.first_name} {feature.creator?.last_name}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                
                {feature.project && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      {feature.project.name}
                    </span>
                  </div>
                )}

                <p className="text-gray-600 mb-4 line-clamp-2">{feature.description}</p>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[feature.status]}`}>
                    {statusLabels[feature.status]}
                  </span>

                  <div className="flex items-center gap-1 text-gray-500">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{feature.votes_count}</span>
                  </div>

                  {feature.deadline && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(feature.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <ResponsibleTeams raci={feature.raci} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}