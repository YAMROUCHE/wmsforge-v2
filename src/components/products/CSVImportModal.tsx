import { useState } from 'react';
import { X, Upload, Download, CheckCircle, XCircle, AlertCircle, FileText, FileSpreadsheet, ArrowRight } from 'lucide-react';
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

interface ColumnMapping {
  [sourceColumn: string]: string; // sourceColumn → targetColumn (sku, name, etc.)
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

  // Mapping de colonnes
  const [showMapping, setShowMapping] = useState(false);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [rawData, setRawData] = useState<any[]>([]);

  // Colonnes cibles attendues
  const targetColumns = [
    { key: 'sku', label: 'SKU', required: true },
    { key: 'name', label: 'Nom', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'category', label: 'Catégorie', required: false },
    { key: 'unitPrice', label: 'Prix unitaire', required: false },
    { key: 'reorderPoint', label: 'Point de réappro', required: false },
  ];

  // Mapping automatique intelligent des colonnes
  const autoMapColumns = (columns: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {};

    const normalize = (str: string) =>
      str.toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]/g, '');

    // Règles de mapping (patterns pour chaque colonne cible)
    const mappingRules: { [key: string]: string[] } = {
      sku: ['sku', 'ref', 'reference', 'code', 'codearticle', 'article', 'produit', 'product'],
      name: ['name', 'nom', 'libelle', 'designation', 'intitule', 'title', 'titre', 'description'],
      description: ['description', 'desc', 'details', 'commentaire', 'comment', 'notes'],
      category: ['category', 'categorie', 'cat', 'famille', 'family', 'type', 'classe'],
      unitPrice: ['unitprice', 'price', 'prix', 'prixunitaire', 'priceunit', 'prixht', 'prixttc', 'tarif', 'montant'],
      reorderPoint: ['reorderpoint', 'reorder', 'stockmin', 'ministock', 'minstock', 'seuilmin', 'seuil', 'threshold'],
    };

    // Pour chaque colonne source, trouver la meilleure correspondance
    columns.forEach(sourceCol => {
      const normalizedSource = normalize(sourceCol);

      for (const [targetKey, patterns] of Object.entries(mappingRules)) {
        if (patterns.some(pattern => normalizedSource.includes(pattern) || pattern.includes(normalizedSource))) {
          // Si pas encore mappé, on l'assigne
          if (!Object.values(mapping).includes(targetKey)) {
            mapping[sourceCol] = targetKey;
            break;
          }
        }
      }
    });

    return mapping;
  };

  // Appliquer le mapping aux données
  const applyMapping = (data: any[], mapping: ColumnMapping): any[] => {
    return data.map(row => {
      const mappedRow: any = {};
      Object.keys(row).forEach(sourceKey => {
        const targetKey = mapping[sourceKey] || sourceKey.toLowerCase();
        mappedRow[targetKey] = row[sourceKey];
      });
      return mappedRow;
    });
  };

  // Validation des champs
  const validateRow = (row: any, lineNumber: number): ProductRow => {
    const errors: ValidationError[] = [];

    // SKU (obligatoire)
    const skuStr = row.sku?.toString().trim() || '';
    if (!skuStr) {
      errors.push({ field: 'sku', message: 'SKU obligatoire' });
    } else if (skuStr.length > 50) {
      errors.push({ field: 'sku', message: 'SKU trop long (max 50 caractères)' });
    }

    // Name (obligatoire)
    const nameStr = row.name?.toString().trim() || '';
    if (!nameStr) {
      errors.push({ field: 'name', message: 'Nom obligatoire' });
    } else if (nameStr.length > 200) {
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
      sku: skuStr,
      name: nameStr,
      description: row.description?.toString().trim() || '',
      category: row.category?.toString().trim() || '',
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

  // Parsing CSV avec PapaParse (sans validation, retourne données brutes + colonnes)
  const parseCSV = (text: string): Promise<{ data: any[]; columns: string[] }> => {
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          const columns = results.meta.fields || [];
          resolve({ data: results.data, columns });
        },
        error: (error: any) => reject(error),
      });
    });
  };

  // Parsing Excel avec xlsx (sans validation, retourne données brutes + colonnes)
  const parseExcel = (arrayBuffer: ArrayBuffer): { data: any[]; columns: string[] } => {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

    const columns = jsonData.length > 0 ? Object.keys(jsonData[0] as Record<string, any>) : [];

    return { data: jsonData, columns };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
    setShowPreview(false);
    setShowMapping(false);
    setParsedRows([]);
    setRawData([]);
    setSourceColumns([]);
    setColumnMapping({});

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
      let parsed: { data: any[]; columns: string[] };

      if (isCSV) {
        const text = await selectedFile.text();
        parsed = await parseCSV(text);
      } else if (isExcel) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        parsed = parseExcel(arrayBuffer);
      } else {
        return;
      }

      // Stocker les données brutes et colonnes
      setRawData(parsed.data);
      setSourceColumns(parsed.columns);

      // Mapping automatique
      const autoMapping = autoMapColumns(parsed.columns);
      setColumnMapping(autoMapping);

      // Afficher l'étape de mapping
      setShowMapping(true);

      addNotification({
        type: 'success',
        title: 'Fichier chargé',
        message: `${parsed.data.length} lignes détectées. Vérifiez le mapping des colonnes.`
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

  // Détecter les doublons de SKU
  const detectDuplicateSKUs = (data: any[]): string[] => {
    const skuCounts = new Map<string, number>();
    data.forEach(row => {
      const sku = row.sku?.toString().trim();
      if (sku) {
        skuCounts.set(sku, (skuCounts.get(sku) || 0) + 1);
      }
    });
    return Array.from(skuCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([sku, _]) => sku);
  };

  // Résolution AUTOMATIQUE des doublons avec numéro séquentiel (garantit 0 doublon)
  // Format : {PREFIX}-{CODE}-{XXXX} où XXXX est un numéro séquentiel
  const autoResolveDuplicates = (data: any[], duplicateSKUs: string[]): any[] => {
    // Compteur global pour garantir l'unicité
    let globalCounter = 1;

    // Map pour tracker les SKUs déjà utilisés
    const usedSKUs = new Set<string>();

    // D'abord, collecter tous les SKUs non-dupliqués
    data.forEach(row => {
      const sku = row.sku?.toString().trim();
      if (sku && !duplicateSKUs.includes(sku)) {
        usedSKUs.add(sku);
      }
    });

    console.log('Resolving', duplicateSKUs.length, 'duplicate SKU groups');

    // Fonction pour extraire un préfixe intelligent depuis les données
    const extractPrefix = (row: any): string => {
      // Chercher une colonne de type "groupe" ou "catégorie" pour le préfixe
      const groupColumns = ['artgrp', 'art grp', 'groupe', 'group', 'category', 'categorie', 'cat'];
      const descColumns = ['description', 'desc', 'name', 'nom', 'designation', 'libelle'];

      let prefix = '';
      let code = '';

      // 1. Chercher un groupe/catégorie (ex: "20")
      for (const colName of Object.keys(row)) {
        if (groupColumns.some(g => colName.toLowerCase().includes(g))) {
          const val = row[colName]?.toString().trim();
          if (val && val.length <= 10) {
            prefix = val.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
            break;
          }
        }
      }

      // 2. Chercher un code depuis la description (3 premières lettres du premier mot)
      for (const colName of Object.keys(row)) {
        if (descColumns.some(d => colName.toLowerCase().includes(d))) {
          const val = row[colName]?.toString().trim();
          if (val) {
            // Prendre les 3 premières lettres du premier mot
            const firstWord = val.split(/\s+/)[0] || '';
            code = firstWord.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
            break;
          }
        }
      }

      // Si pas de préfixe trouvé, utiliser le SKU original raccourci
      if (!prefix) {
        const originalSku = row.sku?.toString().trim() || '';
        // Extraire les chiffres significatifs du SKU original
        const numbers = originalSku.replace(/[^0-9]/g, '');
        prefix = numbers.substring(0, 6) || 'SKU';
      }

      // Construire le préfixe final
      if (code) {
        return `${prefix}-${code}`;
      }
      return prefix;
    };

    // Résoudre les doublons
    const resolvedData = data.map(row => {
      const sku = row.sku?.toString().trim();

      // Si pas de doublon, garder tel quel
      if (!sku || !duplicateSKUs.includes(sku)) {
        return row;
      }

      // Extraire le préfixe intelligent
      const prefix = extractPrefix(row);

      // Générer un SKU unique avec numéro séquentiel
      let newSku: string;
      do {
        // Format: PREFIX-XXXX (ex: 20-VAP-0001)
        const seqNum = globalCounter.toString().padStart(4, '0');
        newSku = `${prefix}-${seqNum}`;
        globalCounter++;
      } while (usedSKUs.has(newSku));

      // Marquer comme utilisé
      usedSKUs.add(newSku);

      // S'assurer que le SKU ne dépasse pas 50 caractères
      if (newSku.length > 50) {
        // Fallback sur un format plus court
        let shortSku: string;
        do {
          shortSku = `SKU-${globalCounter.toString().padStart(6, '0')}`;
          globalCounter++;
        } while (usedSKUs.has(shortSku));
        newSku = shortSku;
        usedSKUs.add(newSku);
      }

      return {
        ...row,
        sku: newSku
      };
    });

    console.log('Resolved duplicates sample:', resolvedData.slice(0, 5).map(r => r.sku));
    console.log('Total unique SKUs generated:', usedSKUs.size);
    return resolvedData;
  };

  // Valider le mapping et lancer la validation
  const handleValidateMapping = () => {
    if (rawData.length === 0) return;

    // Vérifier que les colonnes obligatoires sont mappées
    const requiredColumns = targetColumns.filter(col => col.required).map(col => col.key);
    const mappedTargets = Object.values(columnMapping);

    const missingRequired = requiredColumns.filter(req => !mappedTargets.includes(req));

    if (missingRequired.length > 0) {
      addNotification({
        type: 'error',
        title: 'Mapping incomplet',
        message: `Colonnes obligatoires manquantes: ${missingRequired.join(', ')}`
      });
      return;
    }

    // Appliquer le mapping
    const mappedData = applyMapping(rawData, columnMapping);

    console.log('Mapped data sample:', mappedData.slice(0, 3));

    // Détecter les doublons de SKU
    const duplicates = detectDuplicateSKUs(mappedData);

    console.log('Duplicates detected:', duplicates.length, duplicates.slice(0, 5));

    let dataToValidate = mappedData;

    if (duplicates.length > 0) {
      console.log('Auto-resolving duplicates...');
      // Résolution AUTOMATIQUE des doublons
      dataToValidate = autoResolveDuplicates(mappedData, duplicates);

      addNotification({
        type: 'info',
        title: 'SKUs dupliqués résolus',
        message: `${duplicates.length} SKU(s) dupliqués ont été rendus uniques automatiquement`
      });
    }

    // Valider chaque ligne
    const validatedRows = dataToValidate.map((row, index) =>
      validateRow(row, index + 2)
    );

    setParsedRows(validatedRows);
    setShowMapping(false);
    setShowPreview(true);

    const errorCount = validatedRows.filter(r => r.status === 'error').length;
    const validCount = validatedRows.filter(r => r.status === 'valid').length;

    addNotification({
      type: errorCount > 0 ? 'warning' : 'success',
      title: 'Validation terminée',
      message: `${validCount} ligne(s) valide(s), ${errorCount} erreur(s)`
    });
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

      // Import par batch de 50 produits à la fois pour éviter les timeouts
      const BATCH_SIZE = 50;
      let totalCreated = 0;
      let totalFailed = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        console.log(`Importing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)}: ${batch.length} products`);

        try {
          const batchResult = await importProductsCSV(batch);
          totalCreated += batchResult.created;
          totalFailed += batchResult.failed;
          allErrors.push(...batchResult.errors);
        } catch (error) {
          console.error('Batch import failed:', error);
          totalFailed += batch.length;
          allErrors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Failed to import`);
        }
      }

      const importResult = {
        created: totalCreated,
        failed: totalFailed,
        errors: allErrors
      };

      setResult(importResult);

      if (importResult.created > 0) {
        addNotification({
          type: importResult.failed > 0 ? 'warning' : 'success',
          title: importResult.failed > 0 ? 'Import partiel' : 'Import réussi',
          message: `${importResult.created} produit(s) importé(s)${importResult.failed > 0 ? `, ${importResult.failed} échec(s)` : ''}`
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
              ref={(input) => {
                if (input) {
                  (window as any).fileInput = input;
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                console.log('Button clicked!');
                const input = document.getElementById('file-upload') as HTMLInputElement;
                if (input) {
                  console.log('Triggering input click');
                  input.click();
                }
              }}
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {file ? 'Changer de fichier' : 'Parcourir'}
            </button>
          </div>

          {/* Column Mapping */}
          {showMapping && sourceColumns.length > 0 && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg overflow-hidden">
              <div className="bg-blue-100 px-4 py-3 border-b border-blue-200">
                <h3 className="font-medium text-blue-900 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Correspondance des colonnes
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Vérifiez que chaque colonne de votre fichier correspond à la bonne colonne du système
                </p>
              </div>
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Colonnes source */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Colonnes de votre fichier:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {sourceColumns.map((col, i) => (
                        <li key={i} className="px-3 py-1 bg-gray-100 rounded font-mono">{col}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Mapping */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Colonnes du système:</h4>
                    <div className="space-y-2">
                      {targetColumns.map((target) => {
                        const mappedSource = Object.entries(columnMapping).find(
                          ([_, value]) => value === target.key
                        )?.[0];

                        return (
                          <div key={target.key} className="flex items-center gap-2">
                            <label className="flex-1 text-sm">
                              <span className="font-medium text-gray-900">
                                {target.label}
                                {target.required && <span className="text-red-500 ml-1">*</span>}
                              </span>
                            </label>
                            <select
                              value={mappedSource || ''}
                              onChange={(e) => {
                                const newMapping = { ...columnMapping };
                                // Retirer ancien mapping de cette cible
                                Object.keys(newMapping).forEach(key => {
                                  if (newMapping[key] === target.key) {
                                    delete newMapping[key];
                                  }
                                });
                                // Ajouter nouveau mapping si sélectionné
                                if (e.target.value) {
                                  newMapping[e.target.value] = target.key;
                                }
                                setColumnMapping(newMapping);
                              }}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">-- Non mappé --</option>
                              {sourceColumns.map((col) => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button variant="ghost" onClick={() => {
                    setShowMapping(false);
                    setFile(null);
                    setRawData([]);
                    setSourceColumns([]);
                    setColumnMapping({});
                  }}>
                    Annuler
                  </Button>
                  <Button onClick={handleValidateMapping}>
                    Valider le mapping
                  </Button>
                </div>
              </div>
            </div>
          )}

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
