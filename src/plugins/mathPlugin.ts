import { Plugin } from './types';

export const mathPlugin: Plugin = {
  name: 'math',
  description: 'Evaluate mathematical expressions',
  execute: (input: string): string => {
    try {
      // Extract mathematical expressions from input
      const mathExpressions = input.match(/(\d+(?:\.\d+)?\s*[+\-*/]\s*\d+(?:\.\d+)?(?:\s*[+\-*/]\s*\d+(?:\.\d+)?)*)/g);
      
      if (!mathExpressions || mathExpressions.length === 0) {
        // Try to find simple patterns like "2 + 2" or "calculate 5 * 3"
        const simpleMatch = input.match(/(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/);
        if (simpleMatch) {
          const [, num1, operator, num2] = simpleMatch;
          const result = evaluateSimpleExpression(parseFloat(num1), operator, parseFloat(num2));
          return `${num1} ${operator} ${num2} = ${result}`;
        }
        return 'No valid mathematical expression found in the input.';
      }
      
      const results = mathExpressions.map(expr => {
        const cleanExpr = expr.trim();
        const result = evaluateExpression(cleanExpr);
        return `${cleanExpr} = ${result}`;
      });
      
      return results.join(', ');
    } catch (error) {
      return `Error evaluating mathematical expression: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
