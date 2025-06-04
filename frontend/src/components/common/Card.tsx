// src/components/common/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = false,
  hover = false,
  onClick,
}) => {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  const cardClasses = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClass} ${hoverClass} ${clickableClass} ${className}`;
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Header */}
      {(title || subtitle) && (
        <div className={`${padding !== 'none' ? 'mb-4' : 'mb-2'}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
      
      {/* Footer */}
      {footer && (
        <div className={`${padding !== 'none' ? 'mt-4 pt-4 border-t border-gray-200' : 'mt-2'}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;