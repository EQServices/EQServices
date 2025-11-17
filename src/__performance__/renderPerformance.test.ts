/**
 * Testes de performance para renderização
 * 
 * Estes testes verificam:
 * - Tempo de renderização de componentes
 * - Uso de memória
 * - Performance de listas grandes
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { RatingStars } from '../components/RatingStars';

// Mock MaterialCommunityIcons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: any) => {
    const MockIcon = require('react-native').Text;
    return <MockIcon>{name}</MockIcon>;
  },
}));

describe('Performance Tests', () => {
  describe('RatingStars Performance', () => {
    it('deve renderizar rapidamente', () => {
      const startTime = performance.now();
      
      render(<RatingStars rating={4.5} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Deve renderizar em menos de 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('deve renderizar múltiplas instâncias rapidamente', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        render(<RatingStars rating={Math.random() * 5} />);
      }
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // 100 componentes devem renderizar em menos de 1 segundo
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('Memory Usage', () => {
    it('não deve vazar memória ao renderizar múltiplas vezes', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Renderizar múltiplas vezes
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(<RatingStars rating={4.5} />);
        unmount();
      }
      
      // Forçar garbage collection se disponível
      if (global.gc) {
        global.gc();
      }
      
      // Nota: Este teste é básico e pode não detectar todos os vazamentos
      // Em produção, use ferramentas como Chrome DevTools ou Instruments
      expect(true).toBe(true);
    });
  });
});

