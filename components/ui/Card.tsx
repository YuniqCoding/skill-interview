'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import React, { forwardRef } from 'react';

// React의 onAnimationStart와 framer-motion 충돌 방지
type MotionDivProps = Omit<HTMLMotionProps<'div'>, 'children'>;

interface CardProps extends MotionDivProps {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-slate-900 border border-slate-800',
      elevated: 'bg-slate-900 shadow-xl shadow-black/30',
      bordered: 'bg-transparent border-2 border-slate-700',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hoverable ? { scale: 1.02, y: -2 } : undefined}
        transition={{ duration: 0.2 }}
        className={`
          rounded-2xl 
          ${variants[variant]} 
          ${paddings[padding]} 
          ${hoverable ? 'cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
