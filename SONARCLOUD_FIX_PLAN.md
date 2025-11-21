# SonarCloud Medium Issues - Detailed Fix Implementation Plan

## Phase 1: Quick Wins (1-2 days) - ~90-100 issues fixed

### 1.1 Create Logger Utility (30 minutes)

**File**: `/src/utils/logger.ts`

```typescript
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: any;
}

export const logger = {
  error: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, context);
    } else {
      // TODO: Send to Sentry/error tracking service
      // Sentry.captureException(new Error(message), { contexts: { custom: context } });
    }
  },

  warn: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, context);
    }
  },

  info: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, context);
    }
  },

  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(message, context);
    }
  }
};
```

**Files to Update** (21 instances):
- `/src/contexts/AuthContext.tsx` - Lines 83, 172, 188
- `/src/pages/Dashboard.tsx` - Line 153
- `/src/pages/Products.tsx` - Lines 70, 108
- `/src/pages/Inventory.tsx` - Lines 95, 109, 121, 147, 172, 197
- `/src/pages/Orders.tsx` - Line 70
- `/src/components/ExportButton.tsx` - Line 38
- `/src/components/ReviewPrompt.tsx` - Lines 38, 91

**Replacement Pattern**:
```typescript
// Before:
console.error('Token invalide:', error);

// After:
logger.error('Token invalide', { error });
```

---

### 1.2 Replace alert() with Notifications (30 minutes)

**Files with alert()** (11 instances):
- `/src/pages/Products.tsx` - Line 130
- `/src/pages/Reports.tsx` - Line 33
- `/src/pages/OnboardingSimple.tsx` - Line 65
- `/src/components/ExportButton.tsx` - Lines 26, 39
- `/src/components/products/CSVImportModal.tsx` - Lines 25, 66
- `/src/components/ReviewPrompt.tsx` - Lines 87, 92
- `/src/pages/WarehouseEditorTest.tsx` - Line 10

**Replacement Pattern**:
```typescript
// Before:
if (data.length === 0) {
  alert('Aucune donnée à exporter');
  return;
}

// After:
const { addNotification } = useNotifications();

if (data.length === 0) {
  addNotification({
    type: 'warning',
    title: 'Données vides',
    message: 'Aucune donnée à exporter',
  });
  return;
}
```

---

### 1.3 Create UI Constants (1 hour)

**File**: `/src/constants/ui.ts`

```typescript
export const UI = {
  ANIMATION: {
    TOAST_AUTO_REMOVE_MS: 10000,
    TOAST_EXIT_ANIMATION_MS: 300,
    TOAST_SLIDE_TRANSITION_MS: 400,
    SECTION_CHANGE_MS: 3500,
    TESTIMONIAL_ROTATION_MS: 5000,
    WORKFLOW_STEP_MS: 2000,
    STAT_COUNTER_MS: 30,  // Landing stat 1 increment
    STAT_COUNTER2_MS: 20,  // Landing stat 2 increment
  },
  
  ZOOM: {
    MIN: 0.2,
    MAX: 2,
    STEP: 0.05,
    DEFAULT: 1,
  },
  
  GRID: {
    SIZE: 8,
    PADDING: 20,
    MIN_WIDTH: 1200,
    MIN_HEIGHT: 800,
  },
  
  DRAG_DROP: {
    ACTIVATION_DISTANCE_PX: 8,
  },

  LIMITS: {
    MAX_NOTIFICATIONS_SHOWN: 3,
    RECENT_MOVEMENTS_COUNT: 5,
    DEFAULT_STOCK_THRESHOLD: 10,
    MAX_COMPONENT_SIZE: 400,  // lines
  },

  COLORS: {
    HOVER_BG: 'bg-gray-50 dark:bg-gray-700',
    BORDER_COLOR: 'border-gray-300 dark:border-gray-600',
  },
};
```

**Files to Update** (100+ locations):
- `/src/pages/Landing.tsx` - Lines 32, 70, 78, 88, 96
- `/src/components/warehouse/WarehouseCanvas.tsx` - Lines 78-82
- `/src/components/ToastNotifications.tsx` - Lines 12, 26, 78, 99, 158

**Replacement Pattern**:
```typescript
// Before:
}, 3500);

// After:
}, UI.ANIMATION.SECTION_CHANGE_MS);
```

---

### 1.4 Create Message Constants (1 hour)

**File**: `/src/constants/messages.ts`

```typescript
export const MESSAGES = {
  ERROR: {
    LOADING: 'Erreur chargement',
    LOADING_PRODUCTS: 'Erreur chargement produits',
    LOADING_INVENTORY: 'Erreur chargement inventaire',
    LOADING_DASHBOARD: 'Erreur chargement dashboard',
    SAVING_PRODUCT: 'Erreur sauvegarde produit',
    IMPORT_CSV: 'Erreur lors de l\'import',
    EXPORT: 'Erreur lors de l\'export',
    SUBMISSION: 'Erreur lors de la soumission',
    REVIEW_SUBMISSION: 'Erreur lors de la soumission de l\'avis',
    REFRESH: 'Erreur lors du rafraîchissement',
    NO_FILE_SELECTED: 'Veuillez sélectionner un fichier CSV',
    LOGOUT: 'Erreur lors de la déconnexion',
    INVALID_TOKEN: 'Token invalide',
    DATE_PARSING: 'Erreur lors du parsing de la date',
  },
  
  SUCCESS: {
    SAVED: 'Données sauvegardées',
    EXPORTED: 'Données exportées',
    IMPORTED: 'Données importées',
    REVIEW_SUBMITTED: 'Merci pour votre avis',
  },
  
  INFO: {
    NO_DATA: 'Aucune donnée à exporter',
    CSV_IMPORT_COMING: 'Import CSV à venir...',
    PDF_EXPORT_COMING: 'Export PDF en cours de développement...',
  },
  
  VALIDATION: {
    REQUIRED: 'Ce champ est requis',
    MIN_LENGTH: 'Minimum 10 caractères',
  }
};
```

**Files to Update** (64+ locations):
- `/src/pages/Products.tsx` - Lines 70, 108, 130
- `/src/pages/Inventory.tsx` - Lines 95, 109, 121, 147, 172, 197
- `/src/contexts/AuthContext.tsx` - Lines 83, 172, 188
- And many more...

---

### 1.5 Create Status Constants (30 minutes)

**File**: `/src/constants/status.ts`

```typescript
// Product statuses
export const PRODUCT_STATUSES = ['active', 'inactive', 'discontinued'] as const;
export type ProductStatus = typeof PRODUCT_STATUSES[number];

// Movement types
export const MOVEMENT_TYPES = ['receive', 'move', 'adjust', 'ship'] as const;
export type MovementType = typeof MOVEMENT_TYPES[number];

// ABC Classifications
export const ABC_CLASSES = ['A', 'B', 'C'] as const;
export type ABCClass = typeof ABC_CLASSES[number];

// Warehouse component types
export const COMPONENT_TYPES = [
  'warehouse',
  'zone',
  'aisle',
  'level',
  'rack',
  'location',
  'pallet'
] as const;
export type ComponentType = typeof COMPONENT_TYPES[number];

// Badge styling maps
export const BADGE_STYLES = {
  abc: {
    A: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    B: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    C: 'bg-gray-100 text-gray-800',
  },
  
  status: {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    inactive: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    discontinued: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  },

  movement: {
    receive: 'bg-green-500',
    move: 'bg-blue-500',
    adjust: 'bg-yellow-500',
    ship: 'bg-purple-500',
  }
};
```

**Files to Update** (20+ locations):
- `/src/pages/Products.tsx` - Lines 143-160
- `/src/pages/Dashboard.tsx` - Lines 170, 180
- `/src/pages/Inventory.tsx` - Multiple locations

---

## Phase 2: Medium Effort Tasks (3-5 days) - ~60-70 issues fixed

### 2.1 Fix Any Types (4 hours)

**File**: `/src/types/warehouse.ts`

```typescript
// For DraggableComponent.tsx (6 any instances)
export type ComponentDisplayValue = string | number;

// Discriminated union for component display names
export function getComponentDisplayName(component: WarehouseComponent): ComponentDisplayValue {
  switch (component.type) {
    case 'warehouse':
    case 'zone':
    case 'aisle':
      return component.name;
    case 'level':
      return (component as any).levelNumber;  // Temporary until proper typing
    case 'rack':
    case 'location':
      return (component as any).code;
    case 'pallet':
      return (component as any).palletId;
    default:
      return (component as any).name || '';
  }
}
```

**Files to Update** (56+ instances):
1. `/src/components/warehouse/DraggableComponent.tsx` - Lines 78, 82, 84, 86, 88
2. `/src/components/ExportButton.tsx` - Line 7
3. `/src/utils/exportData.ts` - Lines 31, 36, 41, 246
4. `/src/components/warehouse/WarehouseEditor.tsx` - Lines 212, 236, 279
5. `/src/pages/Dashboard.tsx` - Lines 81, 85, 89
6. `/src/pages/Integrations.tsx` - Lines 206, 265
7. `/src/components/TaskManagementPanel.tsx` - Lines 197, 208
8. `/src/pages/EnterpriseTest.tsx` - Lines 52, 53
9. `/src/pages/Tasks.tsx` - Lines 104-106, 122
10. `/src/pages/Waves.tsx` - Line 106
11. `/src/components/ReviewPrompt.tsx` - Line 25
12. `/src/components/inventory/AdjustStockModal.tsx` - Lines 46, 109

**Replacement Pattern**:
```typescript
// Before:
const response = await fetchAPI('/api/testimonials/prompt/should-show') as any;

// After:
interface ReviewPromptResponse {
  shouldShow: boolean;
}
const response = await fetchAPI<ReviewPromptResponse>('/api/testimonials/prompt/should-show');
```

---

### 2.2 Create Reusable Data Fetching Hook (2 hours)

**File**: `/src/hooks/useFetchData.ts`

```typescript
import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

interface UseFetchDataOptions<T> {
  endpoint: string;
  dependencies?: any[];
  transform?: (data: any) => T;
  onError?: (error: Error) => void;
}

export const useFetchData = <T = any,>({
  endpoint,
  dependencies = [],
  transform,
  onError
}: UseFetchDataOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const rawData = await response.json();
        const transformedData = transform ? transform(rawData) : rawData;
        setData(transformedData);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error('Fetch failed', { endpoint, error });
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, ...dependencies]);

  return { data, loading, error };
};
```

**Files to Update** (15+ duplications):
- `/src/pages/Dashboard.tsx` - Lines 57-102
- `/src/pages/Products.tsx` - Lines 63-80
- `/src/pages/Inventory.tsx` - Lines 86-99
- `/src/pages/Orders.tsx` - Multiple fetch calls
- And many more...

---

### 2.3 Centralize API Endpoints (1 hour)

**File**: `/src/config/api.ts`

```typescript
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8787';

export const API_CONFIG = {
  baseURL: BASE_URL,
  
  endpoints: {
    // Products
    products: '/api/products',
    productsStats: '/api/products/stats',
    
    // Inventory
    inventory: '/api/inventory',
    movements: '/api/inventory/movements',
    
    // Orders
    orders: '/api/orders',
    ordersStats: '/api/orders/stats',
    
    // Locations
    locations: '/api/locations',
    
    // Settings
    settings: '/api/settings',
    settingsProfile: '/api/settings/profile',
    settingsOrganization: '/api/settings/organization',
    settingsNotifications: '/api/settings/notifications',
    settingsAppearance: '/api/settings/appearance',
    
    // Integrations
    integrations: '/api/integrations',
    
    // Testimonials
    testimonialsPrompt: '/api/testimonials/prompt/should-show',
    testimonialsTrack: '/api/testimonials/prompt/track',
    testimonials: '/api/testimonials',
  },

  getFullUrl: (endpoint: keyof typeof API_CONFIG.endpoints) => {
    return `${BASE_URL}${API_CONFIG.endpoints[endpoint]}`;
  }
};
```

**Files to Update** (40+ locations):
- `/src/pages/Dashboard.tsx` - Lines 63-69
- `/src/pages/Products.tsx` - Line 66
- `/src/pages/Inventory.tsx` - Multiple
- `/src/pages/Orders.tsx` - Multiple
- All hook files with fetch calls

---

### 2.4 Extract Landing.tsx Components (6 hours)

**Create new files**:

1. `/src/pages/Landing/Hero.tsx` - Main hero section
2. `/src/pages/Landing/DemoShowcase.tsx` - Demo rotation (Lines 1-150)
3. `/src/pages/Landing/Statistics.tsx` - Stats animation (Lines 150-250)
4. `/src/pages/Landing/Testimonials.tsx` - Testimonials rotation (Lines 250-400)
5. `/src/pages/Landing/Workflow.tsx` - Workflow animation (Lines 400-700)
6. `/src/pages/Landing/FAQ.tsx` - FAQ section (Lines 700-1000)
7. `/src/pages/Landing/Pricing.tsx` - Pricing table (Lines 1000-1300)
8. `/src/pages/Landing/CTA.tsx` - Call to action (Lines 1300-2127)

**New Landing.tsx**:
```typescript
export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <DemoShowcase />
      <Statistics />
      <Testimonials />
      <Workflow />
      <FAQ />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
```

---

### 2.5 Create Badge Styling Utilities (1 hour)

**File**: `/src/utils/badgeStyles.ts`

```typescript
import { BADGE_STYLES } from '../constants/status';
import { ABCClass, ProductStatus, MovementType } from '../constants/status';

export const getBadgeClass = (type: 'abc' | 'status', value: string): string => {
  const styles = BADGE_STYLES[type];
  return styles[value as any] || 'bg-gray-100 text-gray-800';
};

export const getABCBadgeClass = (abcClass?: ABCClass): string => {
  if (!abcClass) return 'bg-gray-100 text-gray-800';
  return BADGE_STYLES.abc[abcClass];
};

export const getStatusBadgeClass = (status: ProductStatus): string => {
  return BADGE_STYLES.status[status];
};

export const getMovementTypeColor = (type: MovementType): string => {
  return BADGE_STYLES.movement[type];
};
```

**Files to Update**:
- `/src/pages/Products.tsx` - Lines 143-150, 154-160 (replace switches)
- `/src/pages/Dashboard.tsx` - Lines 179-186 (replace switches)

---

## Phase 3: Larger Refactoring (1 week) - ~20-30 issues fixed

### 3.1 Extract Modal Components Library (4 hours)

Create `/src/components/modals/` with:
- `BaseModal.tsx` - Reusable modal wrapper
- `ConfirmModal.tsx` - Confirmation dialogs
- `FormModal.tsx` - Form container
- `AdjustStockModal.tsx` - Refactored
- `ProductModal.tsx` - Refactored
- `CSVImportModal.tsx` - Refactored

### 3.2 Create Warehouse Types Properly (3 hours)

Refactor `/src/lib/warehouse.ts` to properly discriminate component types instead of using `any`.

### 3.3 Consolidate Movement Type Logic (2 hours)

Create `/src/utils/movements.ts`:
```typescript
export const getMovementLabel = (type: MovementType): string => {
  const labels: Record<MovementType, string> = {
    receive: 'Réception',
    move: 'Déplacement',
    adjust: 'Ajustement',
    ship: 'Expédition',
  };
  return labels[type];
};

export const getMovementColor = (type: MovementType): string => {
  return BADGE_STYLES.movement[type];
};
```

---

## Testing Strategy

After each phase, run:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# SonarCloud analysis (local)
npm install -g sonarcloud
sonar-scanner

# Count console statements
grep -r "console\." src --include="*.tsx" --include="*.ts" | wc -l
```

Expected progression:
- After Phase 1: ~90-100 issues fixed
- After Phase 2: ~60-70 additional issues fixed  
- After Phase 3: ~20-30 additional issues fixed
- **Total: 170-200 issues fixed (95%+ reduction)**

