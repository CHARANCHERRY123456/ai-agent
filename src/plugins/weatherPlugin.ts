import { Plugin } from './types';

export const weatherPlugin: Plugin = {
  name: 'weather',
  description: 'Get weather information for a city',
  execute: async (input: string): Promise<string> => {
    // Extract city name from input (simple regex)
    const cityMatch = input.match(/weather.*?in\s+([a-zA-Z\s]+)/i) || 
                     input.match(/temperature.*?in\s+([a-zA-Z\s]+)/i) ||
                     input.match(/forecast.*?for\s+([a-zA-Z\s]+)/i);
    
    const city = cityMatch ? cityMatch[1].trim() : 'Unknown City';
    
    // Mock weather data (in real implementation, you'd call a weather API)
    const mockWeatherData: Record<string, { temp: string; condition: string; humidity: string }> = {
      'bangalore': { temp: '24°C', condition: 'Partly Cloudy', humidity: '65%' },
      'mumbai': { temp: '28°C', condition: 'Sunny', humidity: '70%' },
      'delhi': { temp: '22°C', condition: 'Foggy', humidity: '85%' },
      'chennai': { temp: '30°C', condition: 'Hot and Humid', humidity: '75%' },
      'pune': { temp: '25°C', condition: 'Pleasant', humidity: '60%' }
    };
    
    const weather = mockWeatherData[city.toLowerCase()] || {
      temp: '25°C',
      condition: 'Pleasant',
      humidity: '65%'
    };
    
    return `Weather in ${city}: ${weather.temp}, ${weather.condition}, Humidity: ${weather.humidity}`;
  }
};
