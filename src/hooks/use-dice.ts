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
        const expr = manualExpression.trim();

        // Parse dice groups like 4d8, d20, etc.
        const diceRegex = /(\d*)d(\d+)/gi;
        let match;
        const breakdownParts: string[] = [];
        let total = 0;

        // Collect all matches first
        const diceMatches: Array<{count: number; sides: number}> = [];
        while ((match = diceRegex.exec(expr)) !== null) {
          const count = match[1] ? parseInt(match[1], 10) : 1;
          const sides = parseInt(match[2], 10);
          if (Number.isNaN(count) || Number.isNaN(sides) || count <= 0 || sides <= 0) continue;
          diceMatches.push({ count, sides });
        }

        // Roll each dice group
        diceMatches.forEach(dm => {
          const rolls: number[] = [];
          for (let i = 0; i < dm.count; i++) {
            const r = Math.floor(Math.random() * dm.sides) + 1;
            rolls.push(r);
            total += r;
          }
          breakdownParts.push(`${dm.count}d${dm.sides}: [${rolls.join(', ')}]`);
        });

        // Remove dice groups from string and parse remaining numeric modifiers
        let remaining = expr.replace(diceRegex, '');
        // Normalize whitespace
        remaining = remaining.replace(/\s+/g, '');
        const mods = remaining.match(/[+-]?\d+/g) || [];
        let modifierTotal = 0;
        mods.forEach(m => {
          const n = parseInt(m, 10);
          if (!Number.isNaN(n)) {
            modifierTotal += n;
          }
        });

        total += modifierTotal;

        // Build expression string similar to executeRoll
        const expressionParts: string[] = diceMatches.map(d => `${d.count}d${d.sides}`);
        let expressionStr = expressionParts.join(' + ');
        if (modifierTotal !== 0) {
          expressionStr += expressionStr ? (modifierTotal > 0 ? ` + ${modifierTotal}` : ` - ${Math.abs(modifierTotal)}`) : `${modifierTotal}`;
        }
        if (!expressionStr) expressionStr = modifierTotal.toString();

        let breakdownStr = breakdownParts.join(', ');
        if (modifierTotal !== 0) {
          breakdownStr += breakdownStr ? `, ${modifierTotal > 0 ? '+' : ''}${modifierTotal}` : `${modifierTotal}`;
        }

        const result: RollResult = {
          id: uuidv4(),
          timestamp: Date.now(),
          expression: expressionStr,
          total,
          breakdown: breakdownStr || 'manual'
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
