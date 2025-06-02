import React from 'react';
import { TeamRole, TEAMS } from '../types';

interface RaciMatrixProps {
  value: { team: string; role: TeamRole }[];
  onChange: (value: { team: string; role: TeamRole }[]) => void;
}

export default function RaciMatrix({ value, onChange }: RaciMatrixProps) {
  const handleRoleChange = (team: string, role: TeamRole) => {
    const newValue = value.filter(item => item.team !== team);
    if (role) {
      newValue.push({ team, role });
    }
    onChange(newValue);
  };

  const getTeamRole = (team: string): TeamRole | undefined => {
    return value.find(item => item.team === team)?.role;
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Time
              </th>
              <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                R
                <span className="block text-[10px] font-normal normal-case">Responsável</span>
              </th>
              <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                A
                <span className="block text-[10px] font-normal normal-case">Aprovador</span>
              </th>
              <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                C
                <span className="block text-[10px] font-normal normal-case">Consultado</span>
              </th>
              <th className="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                I
                <span className="block text-[10px] font-normal normal-case">Informado</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {TEAMS.map((team) => (
              <tr key={team}>
                <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  {team}
                </td>
                {(['responsible', 'accountable', 'consulted', 'informed'] as TeamRole[]).map((role) => (
                  <td key={role} className="px-3 sm:px-6 py-4 text-center">
                    <input
                      type="radio"
                      name={`raci-${team}`}
                      checked={getTeamRole(team) === role}
                      onChange={() => handleRoleChange(team, role)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}