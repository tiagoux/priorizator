import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ThumbsUp, Clock, CheckCircle2, CircleDot, Rocket, ListTodo, Grid2X2, LayoutList, X, LayoutDashboard, Edit2, ListChecks, Calendar, User, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Feature, FeatureStatus, TeamRole, Project } from '../types';
import RaciMatrix from '../components/RaciMatrix';
import { AuthPage } from '../components/AuthPage';
import { supabase } from '../lib/supabase';
import { ResponsibleTeams } from '../components/ResponsibleTeams';

const statusIcons = {
  not_prioritized: Clock,
  prioritized: ListTodo,
  in_progress: CircleDot,
  done: CheckCircle2,
  in_production: Rocket,
};

const statusLabels = {
  not_prioritized: 'Não Priorizado',
  prioritized: 'Priorizado',
  in_progress: 'Em andamento',
  done: 'Validando',
  in_production: 'Finalizado',
};

const statusColors = {
  not_prioritized: 'bg-gray-100 text-gray-700',
  prioritized: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
  in_production: 'bg-purple-100 text-purple-700',
};

interface ProjectStats {
  total: number;
  inProgress: number;
  completed: number;
  weeklyVotesLeft: number;
}

interface UserMetadata {
  first_name?: string;
  last_name?: string;
}

export function FeaturesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const session = useSession();
  
  const [features, setFeatures] = useState<(Feature & { creator?: UserMetadata; voters?: { user_metadata: UserMetadata }[] })[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFeature, setEditFeature] = useState({
    title: '',
    description: '',
    status: 'not_prioritized' as FeatureStatus,
    deadline: '',
    raci: [] as { team: string; role: TeamRole }[],
  });
  const [sortBy, setSortBy] = useState<'recent' | 'votes'>('votes');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | 'all'>('all');
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    total: 0,
    inProgress: 0,
    completed: 0,
    weeklyVotesLeft: 3,
  });
  const [newFeature, setNewFeature] = useState({
    title: '',
    description: '',
    project_id: projectId || '',
    status: 'not_prioritized' as FeatureStatus,
    deadline: '',
    raci: [] as { team: string; role: TeamRole }[],
  });

  const isAdmin = session?.user?.email === 'tiago.rosa@ecommercebrasil.com.br';

  const fetchWeeklyVotesLeft = useCallback(async () => {
    if (!session || !projectId) return;

    const { data } = await supabase
      .rpc('get_weekly_votes_count', {
        p_user_id: session.user.id,
        p_project_id: projectId
      });

    if (typeof data === 'number') {
      setProjectStats(prev => ({
        ...prev,
        weeklyVotesLeft: Math.max(0, 3 - data)
      }));
    }
  }, [session, projectId]);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (data) setProject(data);
  }, [projectId]);

  const fetchFeatures = useCallback(async () => {
    if (!projectId) return;
    
    let query = supabase
      .from('features')
      .select(`
        *,
        creator:created_by(first_name, last_name),
        voters:votes(user_id, user_metadata:user_profiles!user_id(first_name, last_name))
      `)
      .eq('project_id', projectId);
    
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }
    
    if (sortBy === 'votes') {
      query = query.order('votes_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching features:', error);
      return;
    }
    
    if (data) setFeatures(data);
  }, [projectId, filterStatus, sortBy]);

  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    setNewFeature(prev => ({ ...prev, project_id: projectId }));
    fetchProject();
    fetchFeatures();
    if (session) {
      fetchWeeklyVotesLeft();
    }
  }, [projectId, sortBy, session, navigate, fetchProject, fetchFeatures, fetchWeeklyVotesLeft]);

  useEffect(() => {
    if (selectedFeature) {
      setEditFeature({
        title: selectedFeature.title,
        description: selectedFeature.description || '',
        status: selectedFeature.status,
        deadline: selectedFeature.deadline || '',
        raci: selectedFeature.raci || [],
      });
    }
  }, [selectedFeature]);

  useEffect(() => {
    setProjectStats(prev => ({
      ...prev,
      total: features.length,
      inProgress: features.filter(f => f.status === 'in_progress').length,
      completed: features.filter(f => ['done', 'in_production'].includes(f.status)).length,
    }));
  }, [features]);

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    try {
      const { error } = await supabase
        .from('features')
        .insert([{
          ...newFeature,
          created_by: session.user.id,
          deadline: newFeature.deadline || null,
        }]);

      if (error) throw error;
      
      toast.success('Demanda criada com sucesso!');
      setShowAddFeature(false);
      setNewFeature({
        title: '',
        description: '',
        project_id: projectId || '',
        status: 'not_prioritized',
        deadline: '',
        raci: [],
      });
      fetchFeatures();
    } catch (error: unknown) {
      toast.error('Erro ao criar demanda');
      console.error('Error creating feature:', error);
    }
  };

  const handleUpdateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature || !session) return;

    try {
      const { error } = await supabase
        .from('features')
        .update({
          ...editFeature,
          deadline: editFeature.deadline || null,
        })
        .eq('id', selectedFeature.id);

      if (error) throw error;
      
      toast.success('Demanda atualizada com sucesso!');
      setSelectedFeature(null);
      fetchFeatures();
    } catch (error: unknown) {
      toast.error('Erro ao atualizar demanda');
      console.error('Error updating feature:', error);
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('features')
        .delete()
        .eq('id', featureId);

      if (error) throw error;
      
      toast.success('Demanda excluída com sucesso!');
      setSelectedFeature(null);
      fetchFeatures();
    } catch (error: unknown) {
      toast.error('Erro ao excluir demanda');
      console.error('Error deleting feature:', error);
    }
  };

  const handleVote = async (featureId: string) => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    if (projectStats.weeklyVotesLeft === 0) {
      toast.error('Você atingiu o limite de votos desta semana');
      return;
    }

    const { error } = await supabase
      .from('votes')
      .insert([{ feature_id: featureId, user_id: session.user.id }]);

    if (error) {
      if (error.code === '23505') {
        toast.error('Você já votou nesta demanda');
      } else if (error.message.includes('new row violates row-level security')) {
        toast.error('Você atingiu o limite de votos desta semana');
      } else {
        toast.error('Falha ao registrar voto');
      }
    } else {
      toast.success('Voto registrado com sucesso');
      fetchFeatures();
      fetchWeeklyVotesLeft();
    }
  };

  const formatVoterName = (voter: { user_metadata: UserMetadata }) => {
    if (voter.user_metadata?.first_name) {
      return `${voter.user_metadata.first_name} ${voter.user_metadata.last_name || ''}`.trim();
    }
    return 'Usuário';
  };

  const VoteButton = ({ feature }: { feature: Feature & { voters?: { user_metadata: UserMetadata }[] } }) => (
    <motion.div
      className="group relative"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          handleVote(feature.id);
        }}
        className="flex flex-col items-center gap-1"
        disabled={projectStats.weeklyVotesLeft === 0}
      >
        <ThumbsUp
          size={24}
          className={session ? (projectStats.weeklyVotesLeft > 0 ? 'text-blue-600' : 'text-gray-400') : 'text-gray-400'}
        />
        <span className="text-lg font-semibold">{feature.votes_count}</span>
      </motion.button>
      {feature.voters && feature.voters.length > 0 && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 invisible group-hover:visible z-10">
          <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap">
            <div className="font-semibold mb-1">Votos:</div>
            {feature.voters.map((voter, index) => (
              <div key={index}>{formatVoterName(voter)}</div>
            ))}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
        </div>
      )}
      {session && projectStats.weeklyVotesLeft === 0 && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 invisible group-hover:visible z-10">
          <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap">
            Você atingiu o limite de votos desta semana
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {project && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <ListChecks className="w-5 h-5" />
                <span>Total de Demandas</span>
              </div>
              <span className="text-2xl font-bold">{projectStats.total}</span>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-yellow-600 mb-2">
                <Clock className="w-5 h-5" />
                <span>Em Progresso</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{projectStats.inProgress}</span>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Concluídas</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{projectStats.completed}</span>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <ThumbsUp className="w-5 h-5" />
                <span>Votos Restantes</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{projectStats.weeklyVotesLeft}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'votes')}
                className="rounded-md border-gray-300 shadow-sm px-3 py-1.5 text-sm"
              >
                <option value="votes">Mais Votados</option>
                <option value="recent">Mais Recentes</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FeatureStatus | 'all')}
                className="rounded-md border-gray-300 shadow-sm px-3 py-1.5 text-sm"
              >
                <option value="all">Todos os Status</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <div className="flex border rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                >
                  <Grid2X2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                >
                  <LayoutList className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 ${viewMode === 'kanban' ? 'bg-gray-100' : ''}`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <button
              onClick={() => session ? setShowAddFeature(true) : setShowAuthModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Feature
            </button>
          </div>

          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {(Object.keys(statusLabels) as FeatureStatus[]).map(status => (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    {React.createElement(statusIcons[status], { size: 20 })}
                    <h3 className="font-semibold">{statusLabels[status]}</h3>
                    <span className="ml-auto bg-gray-200 px-2 py-0.5 rounded-full text-sm">
                      {features.filter(f => f.status === status).length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {features
                      .filter(f => f.status === status)
                      .map(feature => (
                        <motion.div
                          key={feature.id}
                          layout
                          onClick={() => setSelectedFeature(feature)}
                          className="bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{feature.title}</h4>
                            <VoteButton feature={feature} />
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {feature.description}
                          </p>
                          <ResponsibleTeams raci={feature.raci} />
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
              "space-y-4"
            }>
              {features.map(feature => (
                <motion.div
                  key={feature.id}
                  layout
                  onClick={() => setSelectedFeature(feature)}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      {feature.creator && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                          <User className="w-4 h-4" />
                          <span>
                            {feature.creator.first_name} {feature.creator.last_name}
                          </span>
                        </div>
                      )}
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                    </div>
                    <VoteButton feature={feature} />
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{feature.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[feature.status]}`}>
                      {statusLabels[feature.status]}
                    </span>
                    
                    {feature.deadline && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(feature.deadline).toLocaleDateString()}
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

      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          >
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <AuthPage onAuthSuccess={() => {
                  setShowAuthModal(false);
                  fetchFeatures();
                }} />
              </div>
            </div>
          </motion.div>
        )}

        {showAddFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          >
            <div className="min-h-screen px-4 text-center">
              <div className="inline-block align-middle my-8 w-full max-w-2xl">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-lg shadow-xl w-full max-h-[80vh] flex flex-col"
                >
                  <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold">Nova Feature</h2>
                    <button
                      onClick={() => setShowAddFeature(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto flex-1 p-6">
                    <form onSubmit={handleCreateFeature} className="space-y-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Título
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={newFeature.title}
                          onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição
                        </label>
                        <textarea
                          id="description"
                          value={newFeature.description}
                          onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                          Data Prevista
                        </label>
                        <input
                          type="datetime-local"
                          id="deadline"
                          value={newFeature.deadline}
                          onChange={(e) => setNewFeature({ ...newFeature, deadline: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Matriz RACI
                        </label>
                        <RaciMatrix
                          value={newFeature.raci}
                          onChange={(raci) => setNewFeature({ ...newFeature, raci })}
                        />
                      </div>
                    </form>
                  </div>

                  <div className="border-t p-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddFeature(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateFeature}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Criar Feature
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          >
            <div className="min-h-screen px-4 text-center">
              <div className="inline-block align-middle my-8 w-full max-w-2xl">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-lg shadow-xl w-full max-h-[80vh] flex flex-col"
                >
                  <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold">
                      {isEditing ? 'Editar Feature' : 'Detalhes da Feature'}
                    </h2>
                    <div className="flex items-center gap-2">
                      {session?.user?.id === selectedFeature.created_by && !isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-2 text-gray-400 hover:text-gray-500"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedFeature(null);
                          setIsEditing(false);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 p-6">
                    {isEditing ? (
                      <form onSubmit={handleUpdateFeature} className="space-y-6">
                        <div>
                          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                            Título
                          </label>
                          <input
                            type="text"
                            id="edit-title"
                            value={editFeature.title}
                            onChange={(e) => setEditFeature({ ...editFeature, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                          </label>
                          <textarea
                            id="edit-description"
                            value={editFeature.description}
                            onChange={(e) => setEditFeature({ ...editFeature, description: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        {isAdmin && (
                          <div>
                            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              id="edit-status"
                              value={editFeature.status}
                              onChange={(e) => setEditFeature({ ...editFeature, status: e.target.value as FeatureStatus })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            
                            >
                              {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          <label htmlFor="edit-deadline" className="block text-sm font-medium text-gray-700 mb-1">
                            Data Prevista
                          </label>
                          <input
                            type="datetime-local"
                            id="edit-deadline"
                            value={editFeature.deadline}
                            onChange={(e) => setEditFeature({ ...editFeature, deadline: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4">
                            Matriz RACI
                          </label>
                          <RaciMatrix
                            value={editFeature.raci}
                            onChange={(raci) => setEditFeature({ ...editFeature, raci })}
                          />
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedFeature.title}</h3>
                          <p className="text-gray-600 whitespace-pre-wrap">{selectedFeature.description}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm ${statusColors[selectedFeature.status]}`}>
                            {statusLabels[selectedFeature.status]}
                          </span>
                          
                          {selectedFeature.deadline && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(selectedFeature.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Responsabilidades</h4>
                          <RaciMatrix
                            value={selectedFeature.raci || []}
                            onChange={() => {}}
                          />
                        </div>

                        {selectedFeature.voters && selectedFeature.voters.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Votos ({selectedFeature.votes_count})</h4>
                            <div className="space-y-1">
                              {selectedFeature.voters.map((voter, index) => (
                                <div key={index} className="text-sm text-gray-600">
                                  {formatVoterName(voter)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t p-6 flex justify-between">
                    <div>
                      {session?.user?.id === selectedFeature.created_by && selectedFeature.status === 'not_prioritized' && (
                        <button
                          onClick={() => handleDeleteFeature(selectedFeature.id)}
                          className="flex items-center px-4 py-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFeature(null);
                          setIsEditing(false);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {isEditing ? 'Cancelar' : 'Fechar'}
                      </button>
                      {isEditing && (
                        <button
                          onClick={handleUpdateFeature}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                          Salvar Alterações
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}