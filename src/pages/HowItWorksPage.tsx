import React from 'react';
import { motion } from 'framer-motion';
import { Vote, ListChecks, Clock } from 'lucide-react';

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Como Funciona
          </h1>
          <p className="text-xl text-gray-600">
            Entenda como funciona nosso sistema de votação de demandas
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Vote className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Sistema de Votação</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <p>• Cada usuário tem direito a 3 votos por semana em cada projeto</p>
              <p>• Os votos são renovados automaticamente toda semana</p>
              <p>• Votos não utilizados não acumulam para a próxima semana</p>
              <p>• Você pode ver seus votos restantes no painel do projeto</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <ListChecks className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Status das Demandas</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <p>• Não Priorizado: Demanda registrada mas ainda não avaliada</p>
              <p>• Priorizado: Demanda aprovada e aguardando início</p>
              <p>• Em Progresso: Demanda em desenvolvimento</p>
              <p>• Concluído: Desenvolvimento finalizado</p>
              <p>• Em Produção: Demanda já disponível em produção</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Ciclo de Vida</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <p>1. Usuários registram novas demandas nos projetos</p>
              <p>2. A comunidade vota nas demandas mais importantes</p>
              <p>3. Demandas mais votadas são priorizadas para desenvolvimento</p>
              <p>4. O status é atualizado conforme o progresso</p>
              <p>5. Todos podem acompanhar o andamento em tempo real</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}