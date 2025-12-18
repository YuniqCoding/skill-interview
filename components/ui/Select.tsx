'use client';

import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder = '선택해주세요',
      error,
      className = '',
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <motion.button
            type="button"
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`
              w-full px-4 py-3 
              bg-slate-800/50 
              border-2 
              ${error ? 'border-red-500' : isOpen ? 'border-indigo-500' : 'border-slate-700'}
              rounded-xl 
              text-left
              focus:outline-none 
              focus:border-indigo-500
              transition-all duration-200
              flex items-center justify-between
            `}
          >
            <span className={selectedOption ? 'text-white' : 'text-slate-500'}>
              {selectedOption ? (
                <span className="flex items-center gap-2">
                  {selectedOption.icon}
                  {selectedOption.label}
                </span>
              ) : (
                placeholder
              )}
            </span>
            <motion.svg
              animate={{ rotate: isOpen ? 180 : 0 }}
              className="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </motion.button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 w-full mt-2 bg-slate-800 border-2 border-slate-700 rounded-xl shadow-xl overflow-hidden"
              >
                {options.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                    onClick={() => {
                      onChange?.(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 
                      text-left 
                      flex items-center gap-2
                      transition-colors duration-150
                      ${option.value === value ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300'}
                    `}
                  >
                    {option.icon}
                    {option.label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay to close dropdown */}
          {isOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;



