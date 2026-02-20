import { useState, useEffect } from 'react';

export interface WeatherData {
    temperature: number;
    windspeed: number;
    condition: string;
}

export function useWeatherRadar() {
    const [weather, setWeather] = useState<WeatherData | null>(null);

    useEffect(() => {
        // Open-Meteo API (No Key Required) - Default to Singapore (NUS)
        // 1.3521° N, 103.8198° E
        const fetchWeather = async () => {
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=1.3521&longitude=103.8198&current_weather=true');
                const data = await response.json();

                if (data && data.current_weather) {
                    setWeather({
                        temperature: data.current_weather.temperature,
                        windspeed: data.current_weather.windspeed,
                        condition: data.current_weather.weathercode > 50 ? 'Wet Track' : 'Dry Track'
                    });
                }
            } catch (err) {
                console.error("Radar offline:", err);
            }
        };

        fetchWeather();
        // Refresh every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return weather;
}
