/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Sun, 
  CloudRain, 
  Cloud, 
  Clock, 
  ArrowRight, 
  Briefcase, 
  ShieldCheck, 
  Zap, 
  AlertCircle,
  PlusCircle,
  PiggyBank,
  Trash2,
  Database,
  ChevronLeft,
  ChevronRight,
  Palette,
  Edit2,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Activity,
  Flame
} from 'lucide-react';
import { Income, Expense, ExchangeRates, WeatherData, AppSettings, ToDoTask, Habit, FixedService } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { customAlert } from '../utils/customAlerts';

export const ARG_CITIES = [
  // --- Capitales y Grandes Centros ---
  { name: 'Buenos Aires (CABA)', lat: -34.6037, lon: -58.3816 },
  { name: 'Córdoba Capital', lat: -31.4201, lon: -64.1888 },
  { name: 'Rosario (Santa Fe)', lat: -32.9468, lon: -60.6395 },
  { name: 'Mendoza Capital', lat: -32.8895, lon: -68.8458 },
  { name: 'San Miguel de Tucumán', lat: -26.8241, lon: -65.2226 },
  { name: 'La Plata (Buenos Aires)', lat: -34.9205, lon: -57.9538 },
  { name: 'Mar del Plata (Buenos Aires)', lat: -38.0055, lon: -57.5426 },
  { name: 'Salta Capital', lat: -24.7860, lon: -65.4117 },
  { name: 'Santa Fe Capital', lat: -31.6107, lon: -60.6973 },
  { name: 'San Juan Capital', lat: -31.5375, lon: -68.5364 },
  { name: 'Resistencia (Chaco)', lat: -27.4506, lon: -58.9865 },
  { name: 'Santiago del Estero', lat: -27.7834, lon: -64.2642 },
  { name: 'Corrientes Capital', lat: -27.4696, lon: -58.8306 },
  { name: 'Posadas (Misiones)', lat: -27.3671, lon: -55.8961 },
  { name: 'San Salvador de Jujuy', lat: -24.1858, lon: -65.2995 },
  { name: 'Bahía Blanca (Buenos Aires)', lat: -38.7183, lon: -62.2662 },
  { name: 'Paraná (Entre Ríos)', lat: -31.7413, lon: -60.5115 },
  { name: 'Neuquén Capital', lat: -38.9516, lon: -68.0591 },
  { name: 'Formosa Capital', lat: -26.1775, lon: -58.1781 },
  { name: 'San Luis Capital', lat: -33.3018, lon: -66.3378 },
  { name: 'La Rioja Capital', lat: -29.4111, lon: -66.8507 },
  { name: 'San Fernando del Valle de Catamarca', lat: -28.4696, lon: -65.7852 },
  { name: 'Santa Rosa (La Pampa)', lat: -36.6167, lon: -64.2833 },
  { name: 'Río Gallegos (Santa Cruz)', lat: -51.6226, lon: -69.2181 },
  { name: 'Viedma (Río Negro)', lat: -40.8130, lon: -62.9961 },
  { name: 'Ushuaia', lat: -54.8019, lon: -68.3030 },
  { name: 'Rawson (Chubut)', lat: -43.3002, lon: -65.1023 },

  // --- Buenos Aires ---
  { name: 'Quilmes (Buenos Aires)', lat: -34.7245, lon: -58.2520 },
  { name: 'San Isidro (Buenos Aires)', lat: -34.4719, lon: -58.5286 },
  { name: 'Tandil (Buenos Aires)', lat: -37.3217, lon: -59.1332 },
  { name: 'Pergamino (Buenos Aires)', lat: -33.8900, lon: -60.5700 },
  { name: 'Olavarría (Buenos Aires)', lat: -36.8927, lon: -60.3225 },
  { name: 'Necochea (Buenos Aires)', lat: -38.5473, lon: -58.7368 },
  { name: 'Junín (Buenos Aires)', lat: -34.5833, lon: -60.9500 },
  { name: 'Chivilcoy (Buenos Aires)', lat: -34.8972, lon: -60.0178 },
  { name: 'Pilar (Buenos Aires)', lat: -34.4587, lon: -58.9142 },
  { name: 'Luján (Buenos Aires)', lat: -34.5703, lon: -59.1050 },
  { name: 'Campana (Buenos Aires)', lat: -34.1642, lon: -58.9592 },
  { name: 'Zárate (Buenos Aires)', lat: -34.0981, lon: -59.0244 },
  { name: 'Tres Arroyos (Buenos Aires)', lat: -38.3739, lon: -60.2798 },
  { name: 'San Nicolás (Buenos Aires)', lat: -33.3335, lon: -60.2110 },
  { name: 'Azul (Buenos Aires)', lat: -36.7768, lon: -59.8586 },

  // --- Córdoba ---
  { name: 'Villa Carlos Paz (Córdoba)', lat: -31.4241, lon: -64.4978 },
  { name: 'Río Cuarto (Córdoba)', lat: -33.1232, lon: -64.3493 },
  { name: 'Villa María (Córdoba)', lat: -32.4075, lon: -63.2402 },
  { name: 'San Francisco (Córdoba)', lat: -31.4278, lon: -62.0827 },
  { name: 'Alta Gracia (Córdoba)', lat: -31.6529, lon: -64.4283 },
  { name: 'Río Tercero (Córdoba)', lat: -32.1742, lon: -64.1132 },
  { name: 'Bell Ville (Córdoba)', lat: -32.6259, lon: -62.6883 },
  { name: 'Jesús María (Córdoba)', lat: -30.9815, lon: -64.0939 },

  // --- Santa Fe ---
  { name: 'Villa Constitución (Santa Fe)', lat: -33.2275, lon: -60.3292 },
  { name: 'Rafaela (Santa Fe)', lat: -31.2503, lon: -61.4867 },
  { name: 'Venado Tuerto (Santa Fe)', lat: -33.7456, lon: -61.9688 },
  { name: 'Reconquista (Santa Fe)', lat: -29.1500, lon: -59.6500 },
  { name: 'Santo Tomé (Santa Fe)', lat: -31.6627, lon: -60.7538 },

  // --- Mendoza ---
  { name: 'San Rafael (Mendoza)', lat: -34.6177, lon: -68.3301 },
  { name: 'Godoy Cruz (Mendoza)', lat: -32.9167, lon: -68.8333 },
  { name: 'Maipú (Mendoza)', lat: -32.9696, lon: -68.7848 },
  { name: 'Luján de Cuyo (Mendoza)', lat: -33.0350, lon: -68.8793 },

  // --- Entre Ríos ---
  { name: 'Concordia (Entre Ríos)', lat: -31.3930, lon: -58.0209 },
  { name: 'Gualeguaychú (Entre Ríos)', lat: -33.0094, lon: -58.5172 },

  // --- Patagonia ---
  { name: 'San Carlos de Bariloche (Río Negro)', lat: -41.1343, lon: -71.3085 },
  { name: 'Comodoro Rivadavia (Chubut)', lat: -45.8641, lon: -67.4958 },
  { name: 'Puerto Madryn (Chubut)', lat: -42.7692, lon: -65.0385 },
  { name: 'Trelew (Chubut)', lat: -43.2490, lon: -65.3051 },
  { name: 'General Roca (Río Negro)', lat: -39.0289, lon: -67.5759 },
  { name: 'Cipolletti (Río Negro)', lat: -38.9333, lon: -67.9833 },
  { name: 'Caleta Olivia (Santa Cruz)', lat: -46.4389, lon: -67.5211 },
  { name: 'Esquel (Chubut)', lat: -42.9138, lon: -71.3194 },

  // --- NOA / NEA ---
  { name: 'San Ramón de la Nueva Orán (Salta)', lat: -23.1378, lon: -64.3262 },
  { name: 'Tartagal (Salta)', lat: -22.5164, lon: -63.8013 },
  { name: 'San Pedro de Jujuy', lat: -24.2253, lon: -64.8660 },
  { name: 'Presidencia Roque Sáenz Peña (Chaco)', lat: -26.7852, lon: -60.4388 },
  { name: 'Villa Ángela (Chaco)', lat: -27.5738, lon: -60.7153 },
  { name: 'Goya (Corrientes)', lat: -29.1400, lon: -59.2635 },
  { name: 'Paso de los Libres (Corrientes)', lat: -29.7125, lon: -57.0874 },
  { name: 'Puerto Iguazú (Misiones)', lat: -25.5991, lon: -54.5736 },
  { name: 'Oberá (Misiones)', lat: -27.4871, lon: -55.1199 },
  { name: 'Clorinda (Formosa)', lat: -25.2848, lon: -57.7185 },

  // --- Cuyo y Centro ---
  { name: 'Villa Mercedes (San Luis)', lat: -33.6744, lon: -65.4594 },
  { name: 'General Pico (La Pampa)', lat: -35.6566, lon: -63.7568 },
  { name: 'Caucete (San Juan)', lat: -31.6500, lon: -68.2833 }
];

export const CARD_QUOTES = [
  "El éxito es la suma de pequeños esfuerzos repetidos un día sí y el otro también. ¡Vamos Elías!",
  "No te detengas hasta sentirte orgulloso de vos mismo. Cada bloque de tiempo cuenta.",
  "El dinero se rinde ante la disciplina. Controlá tu presupuesto y conquistarás tus metas.",
  "En el gimnasio se forja la voluntad; en tu agenda, el futuro. ¡A darlo todo hoy!",
  "La constancia vence lo que la dicha no alcanza. Un pasito más, sin excusas.",
  "El control de tu tiempo es el control de tu libertad. Vos manejás las riendas de tu vida.",
  "Que tu esfuerzo de hoy sea el agradecimiento de tu yo del futuro.",
  "No necesitás estar motivado todos los días, necesitás ser disciplinado cotidianamente.",
  "Tu único rival es la persona que viste en el espejo ayer. Supérate hoy.",
  "La riqueza material es el subproducto de una mente organizada y enfocada.",
  "La consistencia le gana al talento el 100% de las veces. No aflojes hoy.",
  "El plan perfecto no sirve de nada sin una ejecución impecable. Da el primer paso ahora."
];

export const CARD_THEMES = [
  { id: 'cosmic', name: 'Abismo Cósmico 🌌', bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 hover:scale-[1.01]', bullet: 'bg-indigo-650' },
  { id: 'sunset', name: 'Atardecer Láser 🌅', bg: 'bg-gradient-to-br from-[#1c0826] via-[#3a0647] to-[#6d0d46] text-pink-50 hover:scale-[1.01]', bullet: 'bg-pink-600' },
  { id: 'forest', name: 'Zen Forest 🌲', bg: 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-emerald-100 hover:scale-[1.01]', bullet: 'bg-emerald-700' },
  { id: 'cyber', name: 'Ciberpunk ⚡', bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-[#1d1b02] text-amber-50 hover:scale-[1.01]', bullet: 'bg-amber-500' },
  { id: 'vintage', name: 'Diario Vintage 📜', bg: 'bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-stone-100 border border-stone-800 hover:scale-[1.01]', bullet: 'bg-stone-500' },
  { id: 'aurora', name: 'Aurora Polar ❄️', bg: 'bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-900 text-teal-100 hover:scale-[1.01]', bullet: 'bg-teal-500' },
  { id: 'crimson', name: 'Eclipse Carmesí 🔴', bg: 'bg-gradient-to-br from-stone-950 via-rose-950 to-stone-900 text-rose-100 hover:scale-[1.01]', bullet: 'bg-rose-500' },
  { id: 'amber', name: 'Oro Líquido 🪙', bg: 'bg-gradient-to-br from-amber-950 via-zinc-900 to-stone-900 text-amber-400 hover:scale-[1.01]', bullet: 'bg-amber-600' },
  { id: 'neonBlue', name: 'Fusión Neón ☄️', bg: 'bg-gradient-to-br from-[#020d1c] via-[#052137] to-[#140529] text-sky-100 hover:scale-[1.01]', bullet: 'bg-sky-500' },
  { id: 'sepia', name: 'Tierra del Fuego 🔥', bg: 'bg-gradient-to-br from-[#1e130c] via-[#2a1b0e] to-[#120a05] text-amber-100 hover:scale-[1.01]', bullet: 'bg-amber-800' }
];

interface DashboardModuleProps {
  incomes: Income[];
  expenses: Expense[];
  exchangeRates: ExchangeRates;
  setExchangeRates: React.Dispatch<React.SetStateAction<ExchangeRates>>;
  simulatedTime: string; // HH:MM
  onClearAllData: () => void;
  settings?: AppSettings;
  onUpdateSettings?: (newSettings: AppSettings) => void;
  userName?: string;
  tasks: ToDoTask[];
  habits: Habit[];
  services: FixedService[];
  onNavigate: (tab: 'panel' | 'finance' | 'gym' | 'todo' | 'habits' | 'journal' | 'settings') => void;
}

export default function DashboardModule({
  incomes,
  expenses,
  exchangeRates,
  setExchangeRates,
  simulatedTime,
  onClearAllData,
  settings,
  onUpdateSettings,
  userName = 'Elías',
  tasks = [],
  habits = [],
  services = [],
  onNavigate,
}: DashboardModuleProps) {
  // --- States ---
  const [selectedCityName, setSelectedCityName] = useState(() => {
    return localStorage.getItem('control_personal_weather_city') || 'Buenos Aires (CABA)';
  });
  const [citySearchQuery, setCitySearchQuery] = useState('');

  const [useGeolocation, setUseGeolocation] = useState(() => {
    return localStorage.getItem('control_personal_weather_use_geo') === 'true';
  });
  const [geoCoords, setGeoCoords] = useState<{lat: number, lon: number, name: string} | null>(() => {
    try {
      const stored = localStorage.getItem('control_personal_weather_geo_coords');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [weather, setWeather] = useState<WeatherData>({
    temp: 18,
    condition: 'Cargando Clima...',
    iconCode: 0,
    isRaining: false,
    city: 'Buenos Aires, AR',
  });
  
  const [loadingRates, setLoadingRates] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  // Custom Welcome Card States
  const [cardTheme, setCardTheme] = useState(() => {
    return localStorage.getItem('control_personal_card_theme') || 'cosmic';
  });
  const [rotationHour, setRotationHour] = useState(() => {
    return parseInt(localStorage.getItem('control_personal_quote_rotation_hour') || '8', 10);
  });
  const [showCardCustomizer, setShowCardCustomizer] = useState(false);

  // --- Pomodoro state & Dashboard panel configs ---
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroInitialMinutes, setPomodoroInitialMinutes] = useState(25);
  const [dashboardTab, setDashboardTab] = useState<'pomodoro' | 'shortcuts'>('pomodoro');

  useEffect(() => {
    let intervalId: any = null;
    if (isPomodoroActive) {
      intervalId = setInterval(() => {
        if (pomodoroSeconds > 0) {
          setPomodoroSeconds(p => p - 1);
        } else if (pomodoroMinutes > 0) {
          setPomodoroMinutes(p => p - 1);
          setPomodoroSeconds(59);
        } else {
          // Timer finished!
          setIsPomodoroActive(false);
          playPomodoroAlertChime();
          customAlert("⏱️ ¡Tiempo cumplido!\n\nTu bloque de enfoque Pomodoro ha finalizado con éxito.\n¡Excelente esfuerzo, sigue así!", "success", "Sesión de Enfoque");
        }
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isPomodoroActive, pomodoroMinutes, pomodoroSeconds]);

  const playPomodoroAlertChime = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = (window as any).globalAudioCtx || new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      // High pitch major tri-tone alert
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.2, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.25);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.3);
      });
    } catch (e) {
      console.warn("Could not play Pomodoro alert chime:", e);
    }
  };

  // Emergency Fund configurations
  const [isEditingFund, setIsEditingFund] = useState(false);
  const [inputFundPercent, setInputFundPercent] = useState(() => settings?.emergencyFundPercent ?? 5);
  const [inputFundFrequency, setInputFundFrequency] = useState<'semanal' | 'quincenal' | 'mensual'>(() => settings?.emergencyFundFrequency ?? 'semanal');
  const [inputFundEstimatedIncome, setInputFundEstimatedIncome] = useState(() => settings?.emergencyFundEstimatedIncome ?? 500000);

  // Sync state if settings change (due to demodata restorations)
  useEffect(() => {
    if (settings) {
      setInputFundPercent(settings.emergencyFundPercent ?? 5);
      setInputFundFrequency(settings.emergencyFundFrequency ?? 'semanal');
      setInputFundEstimatedIncome(settings.emergencyFundEstimatedIncome ?? 500000);
    }
  }, [settings]);

  const handleSaveFundConfig = () => {
    if (onUpdateSettings && settings) {
      onUpdateSettings({
        ...settings,
        emergencyFundPercent: inputFundPercent,
        emergencyFundFrequency: inputFundFrequency,
        emergencyFundEstimatedIncome: inputFundEstimatedIncome,
      });
      setIsEditingFund(false);
      customAlert('Configuración de Reserva guardada con éxito.', 'success', 'Reserva Guardada');
    } else {
      customAlert('Error de conexión a la base de datos de ajustes.', 'error', 'Error');
    }
  };

  const handleEnableGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('La geolocalización no está soportada por tu navegador/dispositivo.');
      return;
    }
    
    setIsLocating(true);
    setGeoError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const info = {
          lat: latitude,
          lon: longitude,
          name: 'Mi Ubicación Actual 📍',
        };
        setGeoCoords(info);
        setUseGeolocation(true);
        localStorage.setItem('control_personal_weather_use_geo', 'true');
        localStorage.setItem('control_personal_weather_geo_coords', JSON.stringify(info));
        setIsLocating(false);
      },
      (error) => {
        console.error('Error al obtener la ubicación:', error);
        let msg = 'No se pudo acceder a tu ubicación.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permiso de ubicación denegado por el navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Información del GPS no disponible.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Tiempo agotado al buscar ubicación.';
        }
        setGeoError(msg);
        setIsLocating(false);
        setUseGeolocation(false);
        localStorage.setItem('control_personal_weather_use_geo', 'false');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Sync personalizations
  useEffect(() => {
    localStorage.setItem('control_personal_card_theme', cardTheme);
  }, [cardTheme]);

  useEffect(() => {
    localStorage.setItem('control_personal_quote_rotation_hour', rotationHour.toString());
  }, [rotationHour]);

  useEffect(() => {
    localStorage.setItem('control_personal_weather_city', selectedCityName);
    if (!useGeolocation) {
      localStorage.setItem('control_personal_time_timezone', 'America/Argentina/Buenos_Aires');
      window.dispatchEvent(new Event('personal-timezone-updated'));
    }
  }, [selectedCityName, useGeolocation]);

  const selectedCityInfo = ARG_CITIES.find(c => c.name === selectedCityName) || ARG_CITIES[0];

  // --- Live API Fetching ---
  useEffect(() => {
    // 1. Fetch Dolar Rates from dolarapi.com
    const fetchRates = async () => {
      if (exchangeRates.lastUpdated.startsWith('Manual')) return;
      setLoadingRates(true);
      try {
        const res = await fetch('https://dolarapi.com/v1/dolares');
        if (res.ok) {
          const data = await res.json();
          const oficialData = data.find((d: any) => d.casa === 'oficial');
          const blueData = data.find((d: any) => d.casa === 'blue');
          const mepData = data.find((d: any) => d.casa === 'mep');
          
          setExchangeRates({
            oficial: oficialData ? oficialData.venta : 950,
            blue: blueData ? blueData.venta : 1355, // Updated default realistic blue rate
            mep: mepData ? mepData.venta : 1315,
            lastUpdated: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          });
        }
      } catch (err) {
        console.warn('Error fetching live dollar rates, using default estimates:', err);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, [setExchangeRates]);

  // 2. Fetch Weather from OpenMeteo for selected city or current GPS coords
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        let lat, lon, name;
        if (useGeolocation && geoCoords) {
          lat = geoCoords.lat;
          lon = geoCoords.lon;
          name = geoCoords.name;
        } else {
          const info = ARG_CITIES.find(c => c.name === selectedCityName) || ARG_CITIES[0];
          lat = info.lat;
          lon = info.lon;
          name = info.name;
        }

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&timezone=auto`
        );
        if (res.ok) {
          const data = await res.json();
          
          // Save dynamic timezone returned by Open-Meteo
          if (data.timezone) {
            localStorage.setItem('control_personal_time_timezone', data.timezone);
            window.dispatchEvent(new Event('personal-timezone-updated'));
          } else if (!useGeolocation) {
            localStorage.setItem('control_personal_time_timezone', 'America/Argentina/Buenos_Aires');
            window.dispatchEvent(new Event('personal-timezone-updated'));
          }

          const temp = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;
          const humidity = data.current.relative_humidity_2m;
          const wind = Math.round(data.current.wind_speed_10m);
          const precipitation = data.current.precipitation || 0;
          
          // Translation from WMO codes
          let condition = 'Despejado ☀️';
          let isRaining = false;
          
          if (code === 0) {
            condition = 'Despejado y Soleado ☀️';
          } else if (code >= 1 && code <= 3) {
            condition = 'Parcialmente Nublado ⛅';
          } else if (code === 45 || code === 48) {
            condition = 'Presencia de Niebla 🌫️';
          } else if (code >= 51 && code <= 57) {
            condition = 'Llovizna Leve 🌦️';
            isRaining = true;
          } else if (code >= 61 && code <= 67) {
            condition = 'Lluvia Moderada 🌧️';
            isRaining = true;
          } else if (code >= 71 && code <= 77) {
            condition = 'Nieve o Granizo ❄️';
          } else if (code >= 80 && code <= 82) {
            condition = 'Chubascos / Chaparrones de Lluvia 🌧️';
            isRaining = true;
          } else if (code >= 85 && code <= 86) {
            condition = 'Chubascos de Nieve ⛄';
          } else if (code >= 95 && code <= 99) {
            condition = 'Tormenta Eléctrica Fuerte ⚡';
            isRaining = true;
          } else {
            condition = 'Nublado Completo ☁️';
          }
          
          setWeather({
            temp,
            condition: `${condition} • (Humedad: ${humidity}%, Viento: ${wind} km/h, Lluvia: ${precipitation} mm)`,
            iconCode: code,
            isRaining,
            city: name,
          });
        }
      } catch (err) {
        console.warn('Error fetching weather data, using default estimates:', err);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [selectedCityName, useGeolocation, geoCoords]);

  // --- Calculations ---
  // Count only incomes that are effective on or before today
  const todayStr = getLocalDateString();
  const activeIncomes = incomes.filter(inc => {
    if (!inc.date) return true;
    return inc.date <= todayStr;
  });

  const pendingIncomes = incomes.filter(inc => {
    if (!inc.date) return false;
    return inc.date > todayStr;
  });

  const totalIncomeARS = activeIncomes.reduce((sum, inc) => {
    if (inc.currency === 'USD') {
      return sum + inc.amount * exchangeRates.blue;
    }
    return sum + inc.amount;
  }, 0);

  const pendingIncomeARS = pendingIncomes.reduce((sum, inc) => {
    if (inc.currency === 'USD') {
      return sum + inc.amount * exchangeRates.blue;
    }
    return sum + inc.amount;
  }, 0);

  const fundPercent = settings?.emergencyFundPercent ?? 5;
  const fundFrequency = settings?.emergencyFundFrequency ?? 'semanal';
  const fundEstimatedIncome = settings?.emergencyFundEstimatedIncome ?? 500000;

  // B. Emergency Fund (customized percentage of overall active/effective income)
  const emergencyFundARS = totalIncomeARS * (fundPercent / 100);

  // Suggested allocation per paycheck period
  const suggestedPeriodAllocation = fundEstimatedIncome * (fundPercent / 100);

  // C. Average Daily Expenses
  const totalExpensesARS = expenses.reduce((sum, exp) => {
    if (exp.currency === 'USD') {
      return sum + exp.amount * exchangeRates.blue;
    }
    return sum + exp.amount;
  }, 0);
  
  const dailySpendingARS = expenses.length > 0
    ? totalExpensesARS / 30 
    : 15000;

  const survivalDays = Math.ceil(emergencyFundARS / (dailySpendingARS > 0 ? dailySpendingARS : 1));

  const activeTheme = CARD_THEMES.find(t => t.id === cardTheme) || CARD_THEMES[0];

  // Calculate automatic daily motivational message based on hour rotation settings and simulated time
  const [simHour] = simulatedTime.split(':').map(Number);
  const now = new Date();
  
  // Shift day by -1 if simulated hour has not reached the configured rotation shift target hour
  let quoteDay = now.getDate();
  let quoteMonth = now.getMonth() + 1;
  let quoteYear = now.getFullYear();
  
  if (simHour < rotationHour) {
    const prevDate = new Date(now);
    prevDate.setDate(prevDate.getDate() - 1);
    quoteDay = prevDate.getDate();
    quoteMonth = prevDate.getMonth() + 1;
    quoteYear = prevDate.getFullYear();
  }
  
  // Deterministic quote index selector
  const computedQuoteIndex = (quoteYear * 372 + quoteMonth * 31 + quoteDay) % CARD_QUOTES.length;

  const filteredCities = ARG_CITIES.filter(city => 
    city.name.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="dashboard-module-container">
      
      {/* Personalized Customizable welcome card with high-readability box */}
      <div 
        className={`${activeTheme.bg} rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 border border-white/5`} 
        id="welcome-gradient-card"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute left-1/3 bottom-0 w-44 h-44 bg-slate-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">
                <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Nucleus OS</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                ¡Hola, {userName}!
              </h1>
            </div>
            
            {/* Customize toggle button */}
            <button
              onClick={() => setShowCardCustomizer(!showCardCustomizer)}
              className="cursor-pointer bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-all text-xs flex items-center space-x-1 border border-white/10"
              title="Configuración de esta tarjeta"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Estilo y Frase</span>
            </button>
          </div>

          {/* Glass background block for pristine text readability */}
          <div className="bg-black/40 backdrop-blur-[4px] border border-white/10 p-4 rounded-2xl">
            <p 
              className="text-slate-100 text-[13px] sm:text-sm font-bold italic leading-relaxed max-w-xl border-l-[3px] border-emerald-400 pl-3"
              style={{ color: '#eef1f5' }}
            >
              "{CARD_QUOTES[computedQuoteIndex].replace('Elías', userName)}"
            </p>
          </div>

          {/* Expanded customization board */}
          {showCardCustomizer && (
            <div className="bg-black/55 border border-white/10 rounded-2xl p-4 mt-3 space-y-3 animate-in fade-in duration-200 text-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Tema de Tarjeta ({CARD_THEMES.length}):</span>
                <div className="flex gap-1.5 flex-wrap">
                  {CARD_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setCardTheme(theme.id)}
                      className={`cursor-pointer px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 border ${
                        cardTheme === theme.id 
                           ? 'border-white bg-white/25 text-white' 
                          : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${theme.bullet}`}></span>
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configure rotation time criteria */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/10 pt-2.5 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase block tracking-widest">Rotación Automática Diario:</span>
                  <p className="text-[9px] text-slate-400 italic">La frase motivacional rota de forma automática cada 24 horas.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-slate-300">Cambiar mensaje a las:</span>
                  <select
                    value={rotationHour}
                    onChange={(e) => setRotationHour(parseInt(e.target.value, 10))}
                    className="bg-slate-900 border border-slate-700 text-xs px-2.5 py-1 rounded-lg text-white font-bold ml-1"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>
                        {h.toString().padStart(2, '0')}:00 hs
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="bg-black/50 backdrop-blur-[6px] border border-white/10 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-300 block font-semibold">Hora Local Actual</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-lg font-black text-white">{simulatedTime} hs</span>
              </div>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="text-slate-300 block font-semibold">Efectivo Disponible</span>
              <span className="font-black text-emerald-300 text-xl block font-mono mt-0.5">
                ${Math.round(totalIncomeARS - totalExpensesARS).toLocaleString('es-AR')} ARS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="grid grid-cols-1 gap-4" id="api-widgets-grid">
        
        {/* Dynamic Argentine City Weather Box */}
        <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3" id="weather-api-box">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span 
                className="text-xs text-slate-200 uppercase tracking-wider font-extrabold"
                style={{ color: '#f2f6fc' }}
              >
                Clima de Máxima Precisión (Argentina)
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">Direccionamiento Live</span>
            </div>
            
            {/* Searchable City Selector with Geolocation */}
            <div className="pt-1.5 space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEnableGeolocation}
                  disabled={isLocating}
                  className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    useGeolocation
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                      : 'bg-[#070c18] border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className={`${isLocating ? 'animate-spin' : ''}`}>📍</span>
                  <span>
                    {isLocating 
                      ? 'Buscando GPS...' 
                      : useGeolocation 
                        ? 'Ubicación GPS Activa' 
                        : 'Usar Mi Ubicación Actual'}
                  </span>
                </button>
                
                {useGeolocation && (
                  <button
                    type="button"
                    onClick={() => {
                      setUseGeolocation(false);
                      localStorage.setItem('control_personal_weather_use_geo', 'false');
                    }}
                    className="px-3 py-2.5 rounded-xl text-xs font-bold bg-[#204954] border border-slate-800 text-[#eceef2] hover:text-white hover:bg-[#204954]/80 transition-colors cursor-pointer"
                    title="Usar selección manual"
                  >
                    Resetear 🔄
                  </button>
                )}
              </div>

              {geoError && (
                <p className="text-[10px] text-red-400 font-semibold leading-normal bg-red-950/20 border border-red-900/30 rounded-xl px-2.5 py-1">
                  ⚠️ {geoError}
                </p>
              )}

              {!useGeolocation && (
                <div className="space-y-1.5 mt-1">
                  <input
                    type="text"
                    placeholder="🔍 Buscar ciudad (Ej: CABA, Rosario, Mendoza...)"
                    value={citySearchQuery}
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-[#070c18] border border-slate-800 text-white placeholder-slate-500 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <select
                    value={selectedCityName}
                    onChange={(e) => {
                      setSelectedCityName(e.target.value);
                      setCitySearchQuery('');
                    }}
                    className="w-full text-xs font-bold px-3 py-1.5 rounded-xl bg-[#070c18] border border-slate-800 text-white focus:outline-none cursor-pointer font-sans"
                  >
                    {filteredCities.map((city) => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                    {filteredCities.length === 0 && (
                      <option disabled>No se encontraron ciudades argentinas</option>
                    )}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="text-2xl font-black text-white font-mono">{weather.temp}°C</h3>
                <p className="text-[11px] text-slate-300 font-bold leading-relaxed pr-1 mt-0.5">
                  {weather.condition}
                </p>
              </div>
              <div className="p-3 bg-indigo-950/40 text-indigo-400 rounded-2xl shrink-0">
                {weather.isRaining ? (
                  <CloudRain className="w-10 h-10 text-indigo-455 animate-bounce" />
                ) : weather.temp > 24 ? (
                  <Sun className="w-10 h-10 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />
                ) : (
                  <Cloud className="w-10 h-10 text-indigo-455" />
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2 shrink-0">
            {weather.isRaining ? (
              <div className="inline-flex items-center w-full px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-900/40">
                <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-500 shrink-0 animate-pulse" /> 
                <span>🌧️ Está lloviendo. Entrenar adentro hoy sin falta.</span>
              </div>
            ) : (
              <div className="inline-flex items-center w-full px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-500 shrink-0" />
                <span>☀️ Clima despejado. Buen día para entrenamientos al aire libre.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Emergency Fund Integration & Speed Savings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="savings-dashboard-grid">
        
        {/* Emergency Fund Card */}
        <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4" id="emergency-fund-calculator">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-950/40 text-emerald-400 rounded-lg animate-pulse">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <h3 
                    className="text-sm font-bold text-slate-100"
                    style={{ color: '#e1e3e7' }}
                  >
                    Fondo de Emergencia
                  </h3>
                  <p className="text-[11px] text-slate-400">Reserva automática de tus ingresos aproximados</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEditingFund(!isEditingFund)}
                className="cursor-pointer p-1.5 rounded-lg bg-[#141b2d] border border-[#2e3b4e] hover:bg-[#1e293b] text-slate-200 transition-all flex items-center gap-1 text-[10.5px]"
                title="Configurar Fondo"
              >
                <Edit2 className="w-3 h-3 text-emerald-400" />
                <span className="text-[#cbd5e1] font-bold">Modificar</span>
              </button>
            </div>
 
            {isEditingFund ? (
              /* Config Panel */
              <div className="mt-3 bg-[#070c18] border border-slate-100 p-4 rounded-xl space-y-3 animate-fade-in">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Configuración de Mi Reserva</span>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-[9.5px] font-bold text-slate-400 block mb-1">Cada cuánto cobras (Frecuencia)</label>
                    <select
                      value={inputFundFrequency}
                      onChange={(e: any) => setInputFundFrequency(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#0b1323] border border-slate-800 rounded-lg text-white font-bold cursor-pointer"
                    >
                      <option value="semanal">Semanal (Cada Semana)</option>
                      <option value="quincenal">Quincenal (Cada Quincena)</option>
                      <option value="mensual">Mensual (Cada Mes)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block mb-1">Cobro Aprox ($)</label>
                      <input
                        type="number"
                        value={inputFundEstimatedIncome}
                        onChange={(e) => setInputFundEstimatedIncome(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2.5 py-1 text-xs bg-[#0b1323] border border-slate-800 rounded-lg text-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block mb-1">Porcentaje (%)</label>
                      <select
                        value={inputFundPercent}
                        onChange={(e) => setInputFundPercent(parseInt(e.target.value) || 5)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#0b1323] border border-slate-800 rounded-lg text-white font-bold cursor-pointer"
                      >
                        <option value="5">5% (Sugerido)</option>
                        <option value="8">8%</option>
                        <option value="10">10%</option>
                        <option value="15">15%</option>
                        <option value="20">20%</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveFundConfig}
                    className="cursor-pointer flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] py-1.5 rounded-lg transition-all"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => {
                      // Reset and cancel
                      setInputFundPercent(settings?.emergencyFundPercent ?? 5);
                      setInputFundFrequency(settings?.emergencyFundFrequency ?? 'semanal');
                      setInputFundEstimatedIncome(settings?.emergencyFundEstimatedIncome ?? 500000);
                      setIsEditingFund(false);
                    }}
                    className="cursor-pointer px-3 bg-[#1e293b] hover:bg-[#334155] border border-[#2d3a4f] text-[#cbd5e1] hover:text-white font-bold text-[10.5px] py-1.5 rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Detail Info Output View */
              <>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-b border-slate-800/80 py-3 my-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Monto Acumulado Real</span>
                    <span className="text-lg font-black text-white font-mono">
                      ${Math.round(emergencyFundARS).toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Días de Supervivencia</span>
                    <span className="text-2xl font-black text-indigo-400 block font-mono">
                      {survivalDays} <span className="text-xs font-medium text-slate-400">días</span>
                    </span>
                  </div>
                </div>

                {/* Visual Survival Progress Meter */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-3" id="survival-meter-bar">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (survivalDays / 90) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                  <span>Crítico (0 d)</span>
                  <span>Meta Trimestral (90 d)</span>
                </div>

                {/* Customized Paycheck reservation target suggested text blocks */}
                <div className="mt-4 p-3 bg-[#070c18] border border-slate-800/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 mb-0.5">Reserva por {fundFrequency}:</span>
                    <span className="font-extrabold text-emerald-400 font-mono">
                      ${Math.round(suggestedPeriodAllocation).toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-relaxed">
                    Al cobrar aproximados <strong className="text-white">${Math.round(fundEstimatedIncome).toLocaleString('es-AR')} ARS</strong> cada <strong>{fundFrequency === 'semanal' ? 'semana' : fundFrequency === 'quincenal' ? 'quincena' : 'mes'}</strong>, aparta el <strong>{fundPercent}%</strong> para el fondo.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
 
        {/* Nucleus Focus Center & Cockpit Shortcuts Widget */}
        <div className="bg-[#0b1323] border border-slate-800 rounded-2xl p-5 shadow-sm animate-fade-in flex flex-col justify-between space-y-4" id="nucleus-focus-shortcuts-card">
          <div className="space-y-3">
            {/* Tab selector and header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 
                    className="text-xs font-black tracking-wider text-white uppercase font-sans"
                    style={{ color: '#ffffff' }}
                  >
                    NUCLEUS COCKPIT
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Impulsor de enfoque y acceso directo</p>
                </div>
              </div>

              {/* Sub tabs */}
              <div className="bg-[#070c18] p-0.5 rounded-lg border border-slate-800 flex self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDashboardTab('pomodoro')}
                  className={`px-3 py-1 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                    dashboardTab === 'pomodoro'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⏱️ Pomodoro
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardTab('shortcuts')}
                  className={`px-3 py-1 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                    dashboardTab === 'shortcuts'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Atajos OS
                </button>
              </div>
            </div>

            {/* Tab 1: Pomodoro Timer */}
            {dashboardTab === 'pomodoro' && (
              <div className="space-y-4 py-1 animate-fade-in">
                <div className="flex items-center justify-around gap-4">
                  {/* Visual timer block */}
                  <div className="relative flex items-center justify-center w-24 h-24">
                    {/* Ring background */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        className="stroke-slate-900"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        className="stroke-indigo-500 transition-all duration-1000"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 40 * (1 - (pomodoroMinutes * 60 + pomodoroSeconds) / (pomodoroInitialMinutes * 60))
                        }`}
                      />
                    </svg>
                    {/* Inner countdown digits */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-mono text-xl font-black text-white tracking-tighter">
                        {pomodoroMinutes.toString().padStart(2, '0')}:{pomodoroSeconds.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[8px] text-indigo-400 font-extrabold uppercase tracking-widest mt-0.5">
                        {isPomodoroActive ? 'ENFOQUE' : 'PAUSADO'}
                      </span>
                    </div>
                  </div>

                  {/* Preset triggers & Quick Setup */}
                  <div className="flex flex-col space-y-1.5 shrink-0">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">Presets Rápidos:</span>
                    <div className="flex gap-1.5">
                      {[15, 25, 50].map((min) => (
                        <button
                          type="button"
                          key={min}
                          onClick={() => {
                            setIsPomodoroActive(false);
                            setPomodoroMinutes(min);
                            setPomodoroSeconds(0);
                            setPomodoroInitialMinutes(min);
                          }}
                          className={`px-2.5 py-1 text-[10.5px] font-black font-mono tracking-tight rounded-lg border transition-all cursor-pointer ${
                            pomodoroInitialMinutes === min && !isPomodoroActive
                              ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500/50'
                              : 'bg-[#070c18] text-slate-300 border-slate-800 hover:bg-[#141b2e]'
                          }`}
                        >
                          {min}m
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-[160px] italic">
                      Inicia bloques productivos sin distracciones.
                    </p>
                  </div>
                </div>

                {/* Control Action buttons */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPomodoroActive(!isPomodoroActive)}
                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
                      isPomodoroActive
                        ? 'bg-amber-600 hover:bg-amber-550 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-550 text-white'
                    }`}
                  >
                    {isPomodoroActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pausar Enfoque</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Iniciar Bloque</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPomodoroActive(false);
                      setPomodoroMinutes(pomodoroInitialMinutes);
                      setPomodoroSeconds(0);
                    }}
                    className="px-3 py-2 bg-[#070c18] border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Reiniciar a tiempo inicial"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Dashboard Shortcuts Launchpad */}
            {dashboardTab === 'shortcuts' && (
              <div className="grid grid-cols-2 gap-2 py-1 animate-fade-in text-slate-100">
                <button
                  type="button"
                  onClick={() => onNavigate('finance')}
                  className="cursor-pointer bg-[#070c18] hover:bg-[#141b2e] border border-slate-800/80 p-2.5 rounded-xl text-left transition-all hover:scale-[1.01] flex flex-col justify-between h-[68px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] uppercase font-black tracking-wider text-indigo-400">FINANZAS</span>
                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div>
                    <span 
                      className="text-xs font-bold block truncate"
                      style={{ color: '#c4c6ca' }}
                    >
                      Control Monetario
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {services.filter(s => !s.isPaid).length} vencimientos sin pagar
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('gym')}
                  className="cursor-pointer bg-[#070c18] hover:bg-[#141b2e] border border-slate-800/80 p-2.5 rounded-xl text-left transition-all hover:scale-[1.01] flex flex-col justify-between h-[68px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] uppercase font-black tracking-wider text-emerald-400">FISICO</span>
                    <Activity className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div>
                    <span 
                      className="text-xs font-bold block truncate"
                      style={{ color: '#c4c6ca' }}
                    >
                      Rutinas & Carga
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Fuerza progresiva</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('todo')}
                  className="cursor-pointer bg-[#070c18] hover:bg-[#141b2e] border border-slate-800/80 p-2.5 rounded-xl text-left transition-all hover:scale-[1.01] flex flex-col justify-between h-[68px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] uppercase font-black tracking-wider text-amber-400">AGENDA</span>
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div>
                    <span 
                      className="text-xs font-bold block truncate"
                      style={{ color: '#c4c6ca' }}
                    >
                      Time-blocking
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {tasks.filter(t => !t.completed).length} pendientes
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('habits')}
                  className="cursor-pointer bg-[#070c18] hover:bg-[#141b2e] border border-slate-800/80 p-2.5 rounded-xl text-left transition-all hover:scale-[1.01] flex flex-col justify-between h-[68px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] uppercase font-black tracking-wider text-rose-400">HÁBITOS</span>
                    <Flame className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div>
                    <span 
                      className="text-xs font-bold block truncate"
                      style={{ color: '#c4c6ca' }}
                    >
                      Hábitos Atómicos
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {habits.length > 0 ? `${habits.length} hábitos activos` : '0 configurados'}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
 
      </div>
    </div>
  );
}
