import { Plugin, PluginResult } from './types';
import { weatherPlugin } from './weatherPlugin';
import { mathPlugin } from './mathPlugin';

export class PluginManager {
  private plugins: Plugin[] = [weatherPlugin, mathPlugin];

  // Intent detection using natural language patterns
  detectIntent(message: string): Plugin[] {
    const msg = message.toLowerCase();
    const triggeredPlugins: Plugin[] = [];

    // Weather intent - look for natural weather queries
    const weatherPatterns = [
      /weather.*?in\s+\w+/i,
      /temperature.*?in\s+\w+/i,
      /how.*?(hot|cold|warm).*?in\s+\w+/i,
      /forecast.*?for\s+\w+/i,
      /climate.*?in\s+\w+/i
    ];
    
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'climate', 'rain', 'sunny', 'cloudy'];
    
    if (weatherPatterns.some(pattern => pattern.test(message)) || 
        weatherKeywords.some(keyword => msg.includes(keyword))) {
      triggeredPlugins.push(weatherPlugin);
    }

    // Math intent - detect calculation requests
    const mathPatterns = [
      /calculate\s+[\d\s+\-*/().]+/i,
      /what.*?is\s+[\d\s+\-*/().]+/i,
      /solve\s+[\d\s+\-*/().]+/i,
      /\d+\s*[+\-*/]\s*\d+/
    ];
    
    const mathKeywords = ['calculate', 'compute', 'solve', 'math', 'evaluate'];
    const hasNumbersAndOperators = /\d/.test(message) && /[+\-*/=]/.test(message);
    
    if (mathPatterns.some(pattern => pattern.test(message)) || 
        mathKeywords.some(keyword => msg.includes(keyword)) ||
        hasNumbersAndOperators) {
      triggeredPlugins.push(mathPlugin);
    }

    return triggeredPlugins;
  }

  async executePlugins(message: string): Promise<PluginResult[]> {
    const triggeredPlugins = this.detectIntent(message);
    const results: PluginResult[] = [];

    for (const plugin of triggeredPlugins) {
      try {
        console.log(`Executing plugin: ${plugin.name}`);
        const output = await plugin.execute(message);
        results.push({
          pluginName: plugin.name,
          input: message,
          output
        });
      } catch (error) {
        console.error(`Error executing plugin ${plugin.name}:`, error);
        results.push({
          pluginName: plugin.name,
          input: message,
          output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return results;
  }

  formatPluginResults(results: PluginResult[]): string {
    if (results.length === 0) return '';
    
    return results.map(result => {
      // Format results more naturally without screaming plugin names
      if (result.pluginName === 'weather') {
        return `Weather data: ${result.output}`;
      } else if (result.pluginName === 'math') {
        return `Calculation: ${result.output}`;
      }
      return result.output;
    }).join('\n');
  }
}
