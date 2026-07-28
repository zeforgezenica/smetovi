import React, { useEffect, useState } from "react";
import { getWeatherIcon } from "./weatherIconMap";

interface WeatherData {
  temp: number;
  weatherCode: number;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
  };
}

export const Weather: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl =
    "https://api.open-meteo.com/v1/forecast?latitude=44.2447&longitude=17.9781&current=temperature_2m,weather_code&timezone=Europe%2FSarajevo";

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    let cancelled = false;

    async function loadWeather() {
      try {
        const response = await fetch(apiUrl, { signal: controller.signal });
        if (!response.ok) return;

        const data = (await response.json()) as OpenMeteoResponse;
        if (!cancelled) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weather_code,
          });
        }
      } catch {
        // The compact header indicator quietly falls back when weather is unavailable.
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    }

    void loadWeather();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if (loading) {
    return <span className="inline-block min-w-10 text-center" aria-hidden="true">…</span>;
  }

  return (
    <div className="flex flex-row justify-center items-center">
      <span className="mr-2 text-l">{weather ? `${weather.temp}°C` : "–°"}</span>
      {weather && (
        <img
          src={getWeatherIcon(weather.weatherCode)}
          alt=""
          aria-hidden="true"
          className="w-6 h-6"
        />
      )}
    </div>
  );
};

export default Weather;
