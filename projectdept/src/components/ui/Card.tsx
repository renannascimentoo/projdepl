import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  gradient = false 
}) => {
  const baseStyles = 'rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300';
  const gradientStyles = gradient 
    ? 'bg-gradient-to-br from-white/80 to-white/60 border border-white/20' 
    : 'bg-white/90 border border-gray-200/50';
  const hoverStyles = hover ? 'hover:shadow-xl hover:scale-[1.02]' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseStyles} ${gradientStyles} ${hoverStyles} ${className}`}
    >
      {children}
    </motion.div>
  );
};