'use client';

import { motion } from 'framer-motion';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  return (
    <label
      className={`
        flex items-center gap-3 cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <motion.div
        className={`
          w-6 h-6 rounded-lg border-2 
          flex items-center justify-center
          transition-colors duration-200
          ${
            checked
              ? 'bg-indigo-500 border-indigo-500'
              : 'bg-transparent border-slate-600 hover:border-slate-500'
          }
        `}
        whileTap={{ scale: 0.9 }}
        onClick={() => !disabled && onChange(!checked)}
      >
        <motion.svg
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
          className="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>
      <span className="text-slate-300 text-sm">{label}</span>
    </label>
  );
}


