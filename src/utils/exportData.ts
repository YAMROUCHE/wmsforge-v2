/**
 * 📊 Utilitaires Export/Import de Données - 1WMS.io
 *
 * Fonctions pour exporter et importer des données en CSV/Excel
 * Sans dépendances externes - pure JavaScript/TypeScript
 */

/**
 * Convertit un tableau d'objets en CSV
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return '';

  // Si colonnes non spécifiées, utiliser toutes les clés du premier objet
  const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

  // Header
  const header = cols.map(col => col.label).join(',');

  // Rows
  const rows = data.map(item => {
    return cols
      .map(col => {
        let value = item[col.key];

        // Gestion des valeurs nulles/undefined
        if (value === null || value === undefined) {
          value = '';
        }

        // Gestion des dates
        if (value instanceof Date) {
          value = value.toISOString();
        }

        // Gestion des objets
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }

        // Échapper les virgules et guillemets
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Télécharge un fichier CSV
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Ajouter BOM pour support UTF-8 dans Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Exporte des données en CSV et lance le téléchargement
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void {
  const csvContent = convertToCSV(data, columns);
  const filenameWithExt = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadCSV(csvContent, filenameWithExt);
}

/**
 * Parse un fichier CSV en tableau d'objets
 */
export function parseCSV<T = Record<string, string>>(csvContent: string): T[] {
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length === 0) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse rows
  const data: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length === 0) continue;

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    data.push(row as T);
  }

  return data;
}

/**
 * Parse une ligne CSV en tenant compte des guillemets
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Guillemet échappé
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Fin de champ
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Ajouter le dernier champ
  result.push(current.trim());

  return result;
}

/**
 * Lit un fichier CSV uploadé
 */
export function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsText(file);
  });
}

/**
 * Configurations d'export prédéfinies
 */
export const exportConfigs = {
  inventory: {
    filename: 'inventaire',
    columns: [
      { key: 'product_name' as const, label: 'Produit' },
      { key: 'quantity' as const, label: 'Quantité' },
      { key: 'location_name' as const, label: 'Emplacement' },
      { key: 'created_at' as const, label: 'Date création' }
    ]
  },
  products: {
    filename: 'produits',
    columns: [
      { key: 'name' as const, label: 'Nom' },
      { key: 'sku' as const, label: 'SKU' },
      { key: 'category' as const, label: 'Catégorie' },
      { key: 'price' as const, label: 'Prix' },
      { key: 'created_at' as const, label: 'Date création' }
    ]
  },
  orders: {
    filename: 'commandes',
    columns: [
      { key: 'id' as const, label: 'N° Commande' },
      { key: 'customer_name' as const, label: 'Client' },
      { key: 'status' as const, label: 'Statut' },
      { key: 'total_amount' as const, label: 'Montant' },
      { key: 'created_at' as const, label: 'Date' }
    ]
  },
  movements: {
    filename: 'mouvements',
    columns: [
      { key: 'product_name' as const, label: 'Produit' },
      { key: 'type' as const, label: 'Type' },
      { key: 'quantity' as const, label: 'Quantité' },
      { key: 'location_name' as const, label: 'Emplacement' },
      { key: 'created_at' as const, label: 'Date' }
    ]
  },
  locations: {
    filename: 'emplacements',
    columns: [
      { key: 'name' as const, label: 'Nom' },
      { key: 'type' as const, label: 'Type' },
      { key: 'zone' as const, label: 'Zone' },
      { key: 'capacity' as const, label: 'Capacité' },
      { key: 'created_at' as const, label: 'Date création' }
    ]
  }
};

/**
 * Export rapide avec config prédéfinie
 */
export function quickExport<K extends keyof typeof exportConfigs>(
  type: K,
  data: any[]
): void {
  const config = exportConfigs[type];
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${config.filename}_${timestamp}`;

  exportToCSV(data, filename, config.columns as any);
}
