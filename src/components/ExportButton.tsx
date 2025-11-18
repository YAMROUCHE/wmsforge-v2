import { useState } from 'react';
import { Download, FileDown, Loader2 } from 'lucide-react';
import { quickExport, exportConfigs } from '../utils/exportData';

interface ExportButtonProps {
  type: keyof typeof exportConfigs;
  data: any[];
  variant?: 'primary' | 'secondary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export default function ExportButton({
  type,
  data,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = ''
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (data.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    setExporting(true);

    try {
      // Simuler un petit délai pour UX
      await new Promise(resolve => setTimeout(resolve, 300));

      quickExport(type, data);
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  // Styles variants
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 shadow-sm',
    icon: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleExport}
        disabled={disabled || exporting}
        className={`inline-flex items-center justify-center rounded-lg transition-colors ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Exporter en CSV"
      >
        {exporting ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <Download className={iconSizes[size]} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || exporting}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md ${className}`}
    >
      {exporting ? (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
          <span>Export...</span>
        </>
      ) : (
        <>
          <FileDown className={iconSizes[size]} />
          <span>Exporter CSV</span>
        </>
      )}
    </button>
  );
}
