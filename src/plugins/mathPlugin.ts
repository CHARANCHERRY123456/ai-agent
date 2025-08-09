import { Plugin } from './types';

export const mathPlugin: Plugin = {
  name: 'math',
  description: 'Evaluate mathematical expressions and solve calculations',
  execute: (input: string): string => {
    try {
      // Look for mathematical expressions in natural language
      const patterns = [
        /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/g,
        /calculate\s+([\d\s+\-*/().]+)/i,
        /what.*?is\s+([\d\s+\-*/().]+)/i,
        /solve\s+([\d\s+\-*/().]+)/i
      ];
      
      let foundExpression = '';
      
      for (const pattern of patterns) {
        const matches = input.match(pattern);
        if (matches) {
          if (pattern.global) {
            // For the first pattern, we want the full match
            foundExpression = matches[0];
          } else {
            // For other patterns, we want the captured group
            foundExpression = matches[1] || matches[0];
          }
          break;
        }
      }
      
      if (!foundExpression) {
        return 'I can help with calculations! Try asking something like "calculate 15 * 3" or "what is 100 - 25?"';
      }
      
      const result = evaluateExpression(foundExpression.trim());
      
      // Make the response more conversational
      if (foundExpression.includes('+')) {
        return `${foundExpression} equals ${result}`;
      } else if (foundExpression.includes('*')) {
        return `${foundExpression} equals ${result}`;
      } else if (foundExpression.includes('/')) {
        return `${foundExpression} equals ${result}`;
      } else if (foundExpression.includes('-')) {
        return `${foundExpression} equals ${result}`;
      }
      
      return `The answer is ${result}`;
      
    } catch (error) {
      return `I had trouble with that calculation. Could you try rephrasing it? For example: "calculate 5 + 3" or "what is 12 * 4?"`;
    }
  }
};

function evaluateSimpleExpression(num1: number, operator: string, num2: number): number {
  switch (operator) {
    case '+': return num1 + num2;
    case '-': return num1 - num2;
    case '*': return num1 * num2;
    case '/': return num1 / num2;
    default: throw new Error(`Unsupported operator: ${operator}`);
  }
}

function evaluateExpression(expression: string): number {
  // Simple expression evaluator (handles +, -, *, /)
  // Remove spaces
  const cleanExpr = expression.replace(/\s/g, '');
  
  // Security: Only allow numbers, operators, and decimal points
  if (!/^[\d+\-*/.]+$/.test(cleanExpr)) {
    throw new Error('Invalid characters in expression');
  }
  
  // Use Function constructor for safe evaluation (better than eval)
  try {
    // Split by operators while keeping them
    const tokens = cleanExpr.split(/([+\-*/])/).filter(token => token !== '');
    
    if (tokens.length < 3 || tokens.length % 2 === 0) {
      throw new Error('Invalid expression format');
    }
    
    // Simple left-to-right evaluation (no operator precedence for simplicity)
    let result = parseFloat(tokens[0]);
    
    for (let i = 1; i < tokens.length; i += 2) {
      const operator = tokens[i];
      const operand = parseFloat(tokens[i + 1]);
      
      if (isNaN(operand)) {
        throw new Error('Invalid number in expression');
      }
      
      result = evaluateSimpleExpression(result, operator, operand);
    }
    
    return result;
  } catch (error) {
    throw new Error('Failed to evaluate expression');
  }
}
