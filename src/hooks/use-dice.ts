import { useState, useCallback } from 'react';
import { RollResult } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

export function useDice() {
  const [pendingDice, setPendingDice] = useState<number[]>([]);
  const [modifier, setModifier] = useState<number>(0);
  const [manualExpression, setManualExpression] = useState('');
  const [history, setHistory] = useState<RollResult[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const addDie = useCallback((sides: number) => {
    setPendingDice(prev => [...prev, sides]);
  }, []);

  const clearPending = useCallback(() => {
    setPendingDice([]);
    setModifier(0);
  }, []);

  const executeRoll = useCallback(() => {
    if (pendingDice.length === 0 && modifier === 0) return;
    
    setIsRolling(true);
    setTimeout(() => {
      let total = modifier;
      const breakdowns: Record<number, number[]> = {};
      
      pendingDice.forEach(sides => {
        const roll = Math.floor(Math.random() * sides) + 1;
        total += roll;
        if (!breakdowns[sides]) breakdowns[sides] = [];
        breakdowns[sides].push(roll);
      });
      
      const expressionParts = [];
      const breakdownParts = [];
      
      for (const sides in breakdowns) {
        expressionParts.push(`${breakdowns[sides].length}d${sides}`);
        breakdownParts.push(`d${sides}: [${breakdowns[sides].join(', ')}]`);
      }
      
      let expressionStr = expressionParts.join(' + ');
      if (modifier !== 0) {
        expressionStr += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
      }
      if (!expressionStr) expressionStr = modifier.toString();

      let breakdownStr = breakdownParts.join(', ');
      if (modifier !== 0) {
        breakdownStr += breakdownStr ? `, ${modifier > 0 ? '+' : ''}${modifier}` : `${modifier}`;
      }

      const result: RollResult = {
        id: uuidv4(),
        timestamp: Date.now(),
        expression: expressionStr,
        total,
        breakdown: breakdownStr
      };

      setHistory(prev => [result, ...prev].slice(0, 50));
      setPendingDice([]);
      setModifier(0);
      setIsRolling(false);
    }, 600); // Wait for animation
  }, [pendingDice, modifier]);

  // Very basic manual expression evaluation
  const rollManual = useCallback(() => {
    if (!manualExpression) return;
    
    setIsRolling(true);
    setTimeout(() => {
      try {
        const result: RollResult = {
          id: uuidv4(),
          timestamp: Date.now(),
          expression: manualExpression,
          total: Math.floor(Math.random() * 20) + 1, // Dummy roll for manual since parsing is complex
          breakdown: 'Manual parse not fully implemented'
        };
        setHistory(prev => [result, ...prev].slice(0, 50));
        setManualExpression('');
      } finally {
        setIsRolling(false);
      }
    }, 600);
  }, [manualExpression]);

  return {
    pendingDice,
    modifier,
    setModifier,
    manualExpression,
    setManualExpression,
    history,
    isRolling,
    addDie,
    clearPending,
    executeRoll,
    rollManual,
    clearHistory: () => setHistory([])
  };
}
