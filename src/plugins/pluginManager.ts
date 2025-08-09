import { Plugin, PluginResult } from './types';
import { weatherPlugin } from './weatherPlugin';
import { mathPlugin } from './mathPlugin';

export class PluginManager {
  private plugins: Plugin[] = [weatherPlugin, mathPlugin];

  // Simple intent detection based on keywords
  detectIntent(message: string): Plugin[] {
    const lowerMessage = message.toLowerCase();
    const triggeredPlugins: Plugin[] = [];

    // Weather intent detection
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'climate', 'rain', 'sunny', 'cloudy'];
    if (weatherKeywords.some(keyword => lowerMessage.includes(keyword))) {
      triggeredPlugins.push(weatherPlugin);
    }

    // Math intent detection
    const mathKeywords = ['calculate', 'math', 'evaluate', 'compute', '+', '-', '*', '/', '='];
    const hasNumbers = /\d/.test(message);
    const hasMathOperators = /[+\-*/=]/.test(message);
    
    if (mathKeywords.some(keyword => lowerMessage.includes(keyword)) || 
        (hasNumbers && hasMathOperators)) {
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
    
    return results.map(result => 
      `[${result.pluginName.toUpperCase()}]: ${result.output}`
    ).join('\n');
  }
}
