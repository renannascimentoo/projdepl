import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  total: number;
  label?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  label,
  color = 'primary',
  showPercentage = true
}) => {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  const colors = {
    primary: 'from-purple-500 to-pink-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500',
    danger: 'from-red-500 to-rose-500'
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700 font-medium">{label}</span>
          {showPercentage && (
            <span className="text-gray-500">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{progress} completed</span>
        <span>{total} total</span>
      </div>
    </div>
  );
};