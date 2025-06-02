import React from 'react';
import { Users } from 'lucide-react';
import { TeamRole } from '../types';

interface ResponsibleTeamsProps {
  raci?: { team: string; role: TeamRole }[];
}

export function ResponsibleTeams({ raci }: ResponsibleTeamsProps) {
  if (!raci || raci.length === 0) return null;

  const responsibleTeams = raci.filter(item => item.role === 'responsible');
  if (responsibleTeams.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {responsibleTeams.map(item => (
        <span
          key={item.team}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 truncate max-w-[200px]"
        >
          <Users size={12} />
          {item.team}
        </span>
      ))}
    </div>
  );
}