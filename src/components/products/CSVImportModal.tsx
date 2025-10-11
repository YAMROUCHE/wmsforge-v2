import { useState } from 'react';
import { X, Upload, Download, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { importProductsCSV, type CreateProductData } from '../../lib/api';

interface CSVImportModalProps {
  onClose: () => void;
}

export default function CSVImportModal({ onClose }: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Veuillez sélectionner un fichier CSV');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Ignorer la première ligne (headers)
      const dataLines = lines.slice(1);
      
      const products: CreateProductData[] = dataLines.map(line => {
        const [sku, name, description, category, unitPrice, reorderPoint] = line
          .split(',')
          .map(field => field.trim());
        
        return {
          sku,
          name,
          description: description || '',
          category: category || '',
          unitPrice: unitPrice ? (parseFloat(unitPrice) * 100).toString() : '',
          reorderPoint: reorderPoint || '10',
        };
      });

      const importResult = await importProductsCSV(products);
      setResult(importResult);

      if (importResult.created > 0) {
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'import');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'sku,name,description,category,unitPrice,reorderPoint\nPROD-001,Exemple Produit,Description du produit,Catégorie,99.99,10\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_produits.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Import CSV</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Format du fichier CSV</h3>
            <p className="text-sm text-blue-800 mb-3">
              Le fichier doit contenir les colonnes suivantes dans cet ordre :
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li><strong>sku</strong> - Référence unique du produit (obligatoire)</li>
              <li><strong>name</strong> - Nom du produit (obligatoire)</li>
              <li><strong>description</strong> - Description (optionnel)</li>
              <li><strong>category</strong> - Catégorie (optionnel)</li>
              <li><strong>unitPrice</strong> - Prix en euros (optionnel)</li>
              <li><strong>reorderPoint</strong> - Point de réappro (optionnel, défaut: 10)</li>
            </ul>
          </div>

          {/* Download Template */}
          <div className="flex justify-center">
            <Button variant="secondary" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Télécharger le modèle CSV
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {file ? file.name : 'Sélectionnez un fichier CSV'}
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Parcourir
            </label>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-lg p-4 ${
              result.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-start space-x-3">
                {result.failed === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-medium mb-2 ${
                    result.failed === 0 ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    Import terminé
                  </h3>
                  <p className={`text-sm mb-2 ${
                    result.failed === 0 ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    ✓ {result.created} produit(s) créé(s)<br />
                    {result.failed > 0 && `✗ ${result.failed} produit(s) échoué(s)`}
                  </p>
                  {result.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-yellow-900 mb-1">Erreurs :</p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {result.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>• {error}</li>
                        ))}
                        {result.errors.length > 5 && (
                          <li>• ... et {result.errors.length - 5} autres erreurs</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              {result && result.created > 0 ? 'Fermer' : 'Annuler'}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isLoading}
            >
              {isLoading ? 'Import en cours...' : 'Importer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
