import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  subtext?: string;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  subtext,
  highlight = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 shadow-sm ${
        highlight
          ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-orange-500/30'
          : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-white">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-zinc-400">{unit}</span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-zinc-400 font-medium">{subtext}</p>
      )}
    </div>
  );
};

export default StatCard;
