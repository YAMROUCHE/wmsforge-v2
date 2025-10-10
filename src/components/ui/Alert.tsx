import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  className?: string;
}

const variantStyles = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-800',
    message: 'text-green-700',
    Icon: CheckCircle,
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    message: 'text-red-700',
    Icon: XCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
    Icon: AlertCircle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    message: 'text-blue-700',
    Icon: Info,
  },
};

export const Alert: React.FC<AlertProps> = ({ variant, title, message, className }) => {
  const styles = variantStyles[variant];
  const Icon = styles.Icon;
  return (
    <div className={cn('p-4 border rounded-lg flex items-start', styles.container, className)}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.icon)} />
      <div className="ml-3 flex-1">
        {title && <h3 className={cn('text-sm font-medium', styles.title)}>{title}</h3>}
        <p className={cn('text-sm', title ? 'mt-1' : '', styles.message)}>{message}</p>
      </div>
    </div>
  );
};
