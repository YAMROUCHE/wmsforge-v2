import { useState } from 'react';
import { X, Upload, Download, CheckCircle, XCircle, AlertCircle, FileText, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Button } from '../ui/Button';
import { importProductsCSV, type CreateProductData } from '../../lib/api';
import { useNotifications } from '@/contexts/NotificationContext';

interface CSVImportModalProps {
  onClose: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ProductRow {
  lineNumber: number;
  data: Record<string, any>;
  product?: CreateProductData;
  errors: ValidationError[];
  status: 'valid' | 'error' | 'warning';
}

export default function CSVImportModal({ onClose }: CSVImportModalProps) {
  const { addNotification } = useNotifications();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedRows, setParsedRows] = useState<ProductRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Validation des champs
  const validateRow = (row: any, lineNumber: number): ProductRow => {
    const errors: ValidationError[] = [];

    // SKU (obligatoire)
    if (!row.sku || row.sku.trim() === '') {
      errors.push({ field: 'sku', message: 'SKU obligatoire' });
    } else if (row.sku.length > 50) {
      errors.push({ field: 'sku', message: 'SKU trop long (max 50 caractères)' });
    }

    // Name (obligatoire)
    if (!row.name || row.name.trim() === '') {
      errors.push({ field: 'name', message: 'Nom obligatoire' });
    } else if (row.name.length > 200) {
      errors.push({ field: 'name', message: 'Nom trop long (max 200 caractères)' });
    }

    // UnitPrice (optionnel mais doit être valide si présent)
    if (row.unitPrice) {
      const price = parseFloat(row.unitPrice);
      if (isNaN(price)) {
        errors.push({ field: 'unitPrice', message: 'Prix invalide (doit être un nombre)' });
      } else if (price < 0) {
        errors.push({ field: 'unitPrice', message: 'Prix ne peut pas être négatif' });
      }
    }

    // ReorderPoint (optionnel mais doit être valide si présent)
    if (row.reorderPoint) {
      const reorder = parseInt(row.reorderPoint);
      if (isNaN(reorder)) {
        errors.push({ field: 'reorderPoint', message: 'Point de réappro invalide (doit être un entier)' });
      } else if (reorder < 0) {
        errors.push({ field: 'reorderPoint', message: 'Point de réappro ne peut pas être négatif' });
      }
    }

    const product: CreateProductData | undefined = errors.length === 0 ? {
      sku: row.sku.trim(),
      name: row.name.trim(),
      description: row.description?.trim() || '',
      category: row.category?.trim() || '',
      unitPrice: row.unitPrice ? (parseFloat(row.unitPrice) * 100).toString() : '',
      reorderPoint: row.reorderPoint || '10',
    } : undefined;

    return {
      lineNumber,
      data: row,
      product,
      errors,
      status: errors.length === 0 ? 'valid' : 'error',
    };
  };

  // Parsing CSV avec PapaParse
  const parseCSV = (text: string): Promise<ProductRow[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
        complete: (results) => {
          const rows = results.data.map((row: any, index: number) =>
            validateRow(row, index + 2) // +2 car ligne 1 = header
          );
          resolve(rows);
        },
        error: (error: any) => reject(error),
      });
    });
  };

  // Parsing Excel avec xlsx
  const parseExcel = (arrayBuffer: ArrayBuffer): ProductRow[] => {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

    return jsonData.map((row: any, index: number) => {
      // Normaliser les clés (minuscules, trim)
      const normalizedRow: any = {};
      Object.keys(row).forEach(key => {
        normalizedRow[key.trim().toLowerCase()] = row[key];
      });
      return validateRow(normalizedRow, index + 2); // +2 car ligne 1 = header
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setShowPreview(false);
    setParsedRows([]);

    const fileName = selectedFile.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isExcel) {
      addNotification({
        type: 'warning',
        title: 'Fichier invalide',
        message: 'Veuillez sélectionner un fichier CSV ou Excel (.csv, .xlsx, .xls)'
      });
      setFile(null);
      return;
    }

    try {
      setIsLoading(true);
      let rows: ProductRow[] = [];

      if (isCSV) {
        const text = await selectedFile.text();
        rows = await parseCSV(text);
      } else if (isExcel) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        rows = parseExcel(arrayBuffer);
      }

      setParsedRows(rows);
      setShowPreview(true);

      const errorCount = rows.filter(r => r.status === 'error').length;
      const validCount = rows.filter(r => r.status === 'valid').length;

      addNotification({
        type: errorCount > 0 ? 'warning' : 'success',
        title: 'Fichier analysé',
        message: `${validCount} ligne(s) valide(s), ${errorCount} erreur(s) détectée(s)`
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erreur de parsing',
        message: error.message || 'Impossible de lire le fichier'
      });
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || parsedRows.length === 0) return;

    const validRows = parsedRows.filter(r => r.status === 'valid' && r.product);

    if (validRows.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Aucune ligne valide',
        message: 'Corrigez les erreurs avant d\'importer'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const products = validRows.map(r => r.product!);
      const importResult = await importProductsCSV(products);
      setResult(importResult);

      if (importResult.created > 0) {
        addNotification({
          type: 'success',
          title: 'Import réussi',
          message: `${importResult.created} produit(s) importé(s)`
        });
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Erreur d\'import',
        message: error.message || 'Erreur lors de l\'import'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'sku,name,description,category,unitPrice,reorderPoint\nPROD-001,Exemple Produit,Description du produit,Catégorie,99.99,10\nPROD-002,Autre Produit,Description avec virgule dans nom,Catégorie 2,149.99,5\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_produits.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validCount = parsedRows.filter(r => r.status === 'valid').length;
  const errorCount = parsedRows.filter(r => r.status === 'error').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Import Produits</h2>
            <p className="text-sm text-gray-500 mt-1">CSV ou Excel avec validation normative</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Format du fichier
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Formats acceptés : <strong>CSV</strong> ou <strong>Excel</strong> (.xlsx, .xls)
            </p>
            <p className="text-sm text-blue-800 mb-2">Colonnes requises :</p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li><strong>sku</strong> - Référence unique (obligatoire, max 50 car.)</li>
              <li><strong>name</strong> - Nom du produit (obligatoire, max 200 car.)</li>
              <li><strong>description</strong> - Description (optionnel)</li>
              <li><strong>category</strong> - Catégorie (optionnel)</li>
              <li><strong>unitPrice</strong> - Prix en euros (optionnel, doit être ≥ 0)</li>
              <li><strong>reorderPoint</strong> - Point de réappro (optionnel, entier ≥ 0, défaut: 10)</li>
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
            {file ? (
              <div className="flex items-center justify-center gap-3">
                {file.name.endsWith('.csv') ? (
                  <FileText className="w-12 h-12 text-green-500" />
                ) : (
                  <FileSpreadsheet className="w-12 h-12 text-green-500" />
                )}
                <div className="text-left">
                  <p className="text-gray-900 font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Sélectionnez un fichier CSV ou Excel
                </p>
              </>
            )}
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={isLoading}
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {file ? 'Changer de fichier' : 'Parcourir'}
            </label>
          </div>

          {/* Preview */}
          {showPreview && parsedRows.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Aperçu et validation</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="text-green-600 font-medium">{validCount} valides</span>
                    {errorCount > 0 && <span className="text-red-600 font-medium ml-3">{errorCount} erreurs</span>}
                  </p>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ligne</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Erreurs</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parsedRows.map((row) => (
                      <tr key={row.lineNumber} className={row.status === 'error' ? 'bg-red-50' : ''}>
                        <td className="px-3 py-2 text-sm text-gray-500 font-mono">{row.lineNumber}</td>
                        <td className="px-3 py-2">
                          {row.status === 'valid' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.data.sku}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.data.name}</td>
                        <td className="px-3 py-2 text-sm">
                          {row.errors.length > 0 ? (
                            <ul className="text-red-600 space-y-1">
                              {row.errors.map((err, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span>{err.field}: {err.message}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-green-600">OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {parsedRows.length > 0 && (
              <span>
                {validCount} ligne(s) prête(s) à importer
                {errorCount > 0 && <span className="text-red-600 ml-2">({errorCount} avec erreurs)</span>}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              {result && result.created > 0 ? 'Fermer' : 'Annuler'}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isLoading || validCount === 0}
            >
              {isLoading ? 'Import en cours...' : `Importer ${validCount} produit(s)`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
