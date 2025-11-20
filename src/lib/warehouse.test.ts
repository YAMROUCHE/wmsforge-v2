import { describe, it, expect } from 'vitest';
import {
  generateId,
  snapToGrid,
  generateCode,
  canBeChildOf,
  getDepth,
  GRID_SIZE,
  type ComponentType,
} from './warehouse';

describe('warehouse utility functions', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('should generate ID with correct format (timestamp-randomstring)', () => {
      const id = generateId();
      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe('snapToGrid', () => {
    it('should snap value to default grid size (20)', () => {
      expect(snapToGrid(0)).toBe(0);
      expect(snapToGrid(10)).toBe(20);
      expect(snapToGrid(20)).toBe(20);
      expect(snapToGrid(30)).toBe(40);
      expect(snapToGrid(25)).toBe(20);
      expect(snapToGrid(35)).toBe(40);
    });

    it('should snap value to custom grid size', () => {
      expect(snapToGrid(0, 10)).toBe(0);
      expect(snapToGrid(5, 10)).toBe(10);
      expect(snapToGrid(15, 10)).toBe(20);
      expect(snapToGrid(23, 10)).toBe(20);
      expect(snapToGrid(27, 10)).toBe(30);
    });

    it('should handle negative values', () => {
      expect(Math.abs(snapToGrid(-10))).toBe(0); // Handle -0 vs +0
      expect(snapToGrid(-20)).toBe(-20);
      expect(snapToGrid(-25)).toBe(-20);
      expect(snapToGrid(-35)).toBe(-40);
    });

    it('should use GRID_SIZE constant when no gridSize provided', () => {
      expect(snapToGrid(15)).toBe(snapToGrid(15, GRID_SIZE));
    });
  });

  describe('generateCode', () => {
    it('should generate aisle codes as letters (A, B, C)', () => {
      expect(generateCode('aisle', 0)).toBe('A');
      expect(generateCode('aisle', 1)).toBe('B');
      expect(generateCode('aisle', 2)).toBe('C');
      expect(generateCode('aisle', 25)).toBe('Z');
    });

    it('should generate level codes as N1, N2, N3', () => {
      expect(generateCode('level', 0)).toBe('N1');
      expect(generateCode('level', 1)).toBe('N2');
      expect(generateCode('level', 9)).toBe('N10');
    });

    it('should generate rack codes as R01, R02', () => {
      expect(generateCode('rack', 0)).toBe('R01');
      expect(generateCode('rack', 1)).toBe('R02');
      expect(generateCode('rack', 9)).toBe('R10');
      expect(generateCode('rack', 99)).toBe('R100');
    });

    it('should generate location codes as L001, L002', () => {
      expect(generateCode('location', 0)).toBe('L001');
      expect(generateCode('location', 1)).toBe('L002');
      expect(generateCode('location', 9)).toBe('L010');
      expect(generateCode('location', 99)).toBe('L100');
      expect(generateCode('location', 999)).toBe('L1000');
    });

    it('should generate pallet codes as P0001, P0002', () => {
      expect(generateCode('pallet', 0)).toBe('P0001');
      expect(generateCode('pallet', 1)).toBe('P0002');
      expect(generateCode('pallet', 9)).toBe('P0010');
      expect(generateCode('pallet', 99)).toBe('P0100');
      expect(generateCode('pallet', 9999)).toBe('P10000');
    });

    it('should generate default codes for warehouse and zone', () => {
      expect(generateCode('warehouse', 0)).toBe('WAREHOUSE-1');
      expect(generateCode('warehouse', 1)).toBe('WAREHOUSE-2');
      expect(generateCode('zone', 0)).toBe('ZONE-1');
      expect(generateCode('zone', 5)).toBe('ZONE-6');
    });
  });

  describe('canBeChildOf', () => {
    it('should allow warehouse as root child', () => {
      expect(canBeChildOf('warehouse', null)).toBe(true);
    });

    it('should not allow other types as root child', () => {
      expect(canBeChildOf('zone', null)).toBe(false);
      expect(canBeChildOf('aisle', null)).toBe(false);
      expect(canBeChildOf('location', null)).toBe(false);
    });

    it('should enforce correct hierarchy: warehouse -> zone', () => {
      expect(canBeChildOf('zone', 'warehouse')).toBe(true);
      expect(canBeChildOf('aisle', 'warehouse')).toBe(false);
      expect(canBeChildOf('rack', 'warehouse')).toBe(false);
    });

    it('should enforce correct hierarchy: zone -> aisle', () => {
      expect(canBeChildOf('aisle', 'zone')).toBe(true);
      expect(canBeChildOf('level', 'zone')).toBe(false);
      expect(canBeChildOf('warehouse', 'zone')).toBe(false);
    });

    it('should enforce correct hierarchy: aisle -> level', () => {
      expect(canBeChildOf('level', 'aisle')).toBe(true);
      expect(canBeChildOf('rack', 'aisle')).toBe(false);
    });

    it('should enforce correct hierarchy: level -> rack', () => {
      expect(canBeChildOf('rack', 'level')).toBe(true);
      expect(canBeChildOf('location', 'level')).toBe(false);
    });

    it('should enforce correct hierarchy: rack -> location', () => {
      expect(canBeChildOf('location', 'rack')).toBe(true);
      expect(canBeChildOf('pallet', 'rack')).toBe(false);
    });

    it('should enforce correct hierarchy: location -> pallet', () => {
      expect(canBeChildOf('pallet', 'location')).toBe(true);
      expect(canBeChildOf('rack', 'location')).toBe(false);
    });

    it('should not allow pallet to have children', () => {
      expect(canBeChildOf('warehouse', 'pallet')).toBe(false);
      expect(canBeChildOf('zone', 'pallet')).toBe(false);
      expect(canBeChildOf('location', 'pallet')).toBe(false);
      expect(canBeChildOf('pallet', 'pallet')).toBe(false);
    });
  });

  describe('getDepth', () => {
    it('should return correct depth for each component type', () => {
      expect(getDepth('warehouse')).toBe(0);
      expect(getDepth('zone')).toBe(1);
      expect(getDepth('aisle')).toBe(2);
      expect(getDepth('level')).toBe(3);
      expect(getDepth('rack')).toBe(4);
      expect(getDepth('location')).toBe(5);
      expect(getDepth('pallet')).toBe(6);
    });

    it('should maintain depth hierarchy order', () => {
      const types: ComponentType[] = ['warehouse', 'zone', 'aisle', 'level', 'rack', 'location', 'pallet'];

      for (let i = 0; i < types.length - 1; i++) {
        expect(getDepth(types[i])).toBeLessThan(getDepth(types[i + 1]));
      }
    });
  });
});
