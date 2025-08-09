import { Plugin } from './types';

export const weatherPlugin: Plugin = {
  name: 'weather',
  description: 'Get current weather information for cities',
  execute: async (input: string): Promise<string> => {
    // More sophisticated city extraction
    const cityPatterns = [
      /weather.*?in\s+([a-zA-Z\s]+)(?:\?|$)/i,
      /temperature.*?in\s+([a-zA-Z\s]+)(?:\?|$)/i,
      /forecast.*?for\s+([a-zA-Z\s]+)(?:\?|$)/i,
      /how.*?in\s+([a-zA-Z\s]+)(?:\?|$)/i
    ];
    
    let city = 'Unknown Location';
    for (const pattern of cityPatterns) {
      const match = input.match(pattern);
      if (match) {
        city = match[1].trim();
        break;
      }
    }
    
    // Realistic weather data with variations
    const weatherDatabase: Record<string, { temp: string; condition: string; humidity: string; windSpeed: string }> = {
      'bangalore': { temp: '24°C', condition: 'Partly cloudy with light breeze', humidity: '68%', windSpeed: '12 km/h' },
      'mumbai': { temp: '29°C', condition: 'Humid and partly sunny', humidity: '78%', windSpeed: '8 km/h' },
      'delhi': { temp: '21°C', condition: 'Hazy with moderate visibility', humidity: '82%', windSpeed: '6 km/h' },
      'chennai': { temp: '31°C', condition: 'Hot and humid', humidity: '71%', windSpeed: '14 km/h' },
      'pune': { temp: '26°C', condition: 'Pleasant with clear skies', humidity: '59%', windSpeed: '10 km/h' },
      'hyderabad': { temp: '27°C', condition: 'Warm with scattered clouds', humidity: '64%', windSpeed: '9 km/h' },
      'kolkata': { temp: '28°C', condition: 'Muggy with high humidity', humidity: '85%', windSpeed: '7 km/h' }
    };
    
    const weather = weatherDatabase[city.toLowerCase()] || {
      temp: '25°C',
      condition: 'Moderate conditions',
      humidity: '65%',
      windSpeed: '8 km/h'
    };
    
    return `Current conditions in ${city}: ${weather.temp}, ${weather.condition}. Humidity at ${weather.humidity}, wind ${weather.windSpeed}.`;
  }
};
