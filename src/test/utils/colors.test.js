import { describe, it, expect } from 'vitest';
import { getScoreColor, getScoreColorInline } from '../../utils/colors';

describe('colors utils', () => {
  describe('getScoreColor', () => {
    it('returns correct classes for score 1', () => {
      const result = getScoreColor(1);
      expect(result).toEqual({ bg: 'bg-red-500', text: 'text-white', hover: 'hover:bg-red-600' });
    });

    it('returns correct classes for score 6', () => {
      const result = getScoreColor(6);
      expect(result).toEqual({ bg: 'bg-green-700', text: 'text-white', hover: 'hover:bg-green-800' });
    });

    it('returns default gray classes for invalid score', () => {
      const result = getScoreColor(99);
      expect(result).toEqual({ bg: 'bg-gray-300', text: 'text-gray-700', hover: 'hover:bg-gray-400' });
    });
  });

  describe('getScoreColorInline', () => {
    it('returns correct styles for score 1', () => {
      const result = getScoreColorInline(1);
      expect(result).toEqual({ backgroundColor: '#ef4444', color: '#ffffff' });
    });

    it('returns correct styles for score 6', () => {
      const result = getScoreColorInline(6);
      expect(result).toEqual({ backgroundColor: '#15803d', color: '#ffffff' });
    });

    it('returns default styles for invalid score', () => {
      const result = getScoreColorInline(99);
      expect(result).toEqual({ backgroundColor: '#d1d5db', color: '#374151' });
    });
  });
});
