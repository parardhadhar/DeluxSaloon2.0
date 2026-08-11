import { Region } from './playlist';

export type WeatherInfo = {
  icon: string;
  condition: string;
  temp: string;
  flavor: string;
  isLive?: boolean;
};

const CITY_COORDS: Record<Region, { lat: number; lon: number }> = {
  mumbai: { lat: 19.0760, lon: 72.8777 },
  delhi: { lat: 28.6139, lon: 77.2090 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
};

// Map WMO weathercode + temperature into 100% Native Regional Languages per region
function mapWMOToRegional(code: number, tempC: number, region: Region): { icon: string; condition: string; flavor: string } {
  const isHot = tempC >= 30;
  const isWarm = tempC >= 25 && tempC < 30;
  const isCold = tempC < 20;

  const isRain = (code >= 50 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
  const isFog = code === 45 || code === 48;

  // ── MUMBAI (MARATHI) ──
  if (region === 'mumbai') {
    if (isRain) return { icon: '🌧️', condition: 'आज पाऊस पडत आहे', flavor: 'बाहेर पाणी भरले आहे, सलूनमध्ये बसा' };
    if (isFog) return { icon: '🌫️', condition: 'आज थोडे धुके आहे', flavor: 'धुक्यात रेडिओचा गोड आवाज' };
    if (isCold) return { icon: '❄️', condition: 'आज गुलाबी थंडी आहे', flavor: 'गरम चहा आणि जुनी गाणी' };
    if (isHot) return { icon: '🔥', condition: 'आज खूप उकाडा आहे', flavor: 'पंख्याची हवा थंड वाटतेय' };
    if (isWarm && code === 0) return { icon: '☀️', condition: 'आज छान ऊन पडले आहे', flavor: 'काचांवर ऊन चमकत आहे' };
    return { icon: '⛅', condition: 'आज सुखद हवामान आहे', flavor: 'चहा आणा भाऊ' };
  }

  // ── DELHI (HINDI) ──
  if (region === 'delhi') {
    if (isRain) return { icon: '🌧️', condition: 'आज बारिश हो रही है', flavor: 'बाहर पानी भर गया, दुकान में बैठकर सुनो' };
    if (isFog) return { icon: '🌫️', condition: 'आज घना कोहरा है', flavor: 'कोहरे में रेडियो की सुरीली आवाज' };
    if (isCold) return { icon: '❄️', condition: 'आज कड़ाके की ठंड है', flavor: 'गरम चाय और पुरानी यादें' };
    if (isHot) return { icon: '🔥', condition: 'आज भीषण गर्मी है', flavor: 'कूलर फुल स्पीड पर चलाओ भैया' };
    if (isWarm && code === 0) return { icon: '☀️', condition: 'आज तेज धूप है', flavor: 'धूप में बैठकर शेव करवाओ' };
    return { icon: '⛅', condition: 'आज सुहाना मौसम है', flavor: 'चाय पिलाओ भाई' };
  }

  // ── CHENNAI (TAMIL) ──
  if (region === 'chennai') {
    if (isRain) return { icon: '🌧️', condition: 'இன்று மழை பெய்கிறது', flavor: 'வெளியே மழை, கடையில் அமர்ந்து பாட்டு கேளுங்கள்' };
    if (isFog) return { icon: '🌫️', condition: 'இன்று பனிமூட்டம்', flavor: 'ரேடியோவில் மெல்லிசைப் பாடல்கள்' };
    if (isCold) return { icon: '❄️', condition: 'இன்று குளிர்ந்த காற்று', flavor: 'சூடான டீயுடன் இனிமையான பாடல்' };
    if (isHot) return { icon: '🔥', condition: 'இன்று பயங்கர வெயில்', flavor: 'ஃபேன் காற்றை இங்கு திருப்புங்கள்' };
    if (isWarm && code === 0) return { icon: '☀️', condition: 'இன்று நல்ல வெயில்', flavor: 'முதலில் இளநீர் குடியுங்கள்' };
    return { icon: '⛅', condition: 'இன்று இதமான வானிலை', flavor: 'டீ கொண்டு வாப்பா' };
  }

  // ── KOLKATA (BENGALI) ──
  if (region === 'kolkata') {
    if (isRain) return { icon: '🌧️', condition: 'আজ বৃষ্টি হচ্ছে', flavor: 'বাইরে জল জমে গেছে, দোকানে বসে গান শুনুন' };
    if (isFog) return { icon: '🌫️', condition: 'আজ কুয়াশা আছে', flavor: 'রেডিওর সুরে সকালের শুরু' };
    if (isCold) return { icon: '❄️', condition: 'আজ বেশ ঠান্ডা পড়েছে', flavor: 'ভাঁড়ের চা আর পুরানো দিনের গান' };
    if (isHot) return { icon: '🔥', condition: 'আজ খুব গরম পড়েছে', flavor: 'হাতপাখাটা একটু দিন তো দাদা' };
    if (isWarm && code === 0) return { icon: '☀️', condition: 'আজ মিষ্টি রোদ', flavor: 'আড্ডা জমাবার সেরা সময়' };
    return { icon: '⛅', condition: 'আজ সুন্দর আবহাওয়া', flavor: 'এক কাপ চা দাও তো দাদা' };
  }

  return { icon: '🌤️', condition: 'आज सुंदर हवामान', flavor: 'सलूनमध्ये संगीताचा आनंद' };
}

// Cache live weather responses in memory
const weatherCache: Partial<Record<Region, { data: WeatherInfo; timestamp: number }>> = {};
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchLiveWeather(region: Region): Promise<WeatherInfo> {
  const now = Date.now();
  const cached = weatherCache[region];
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  try {
    const coords = CITY_COORDS[region];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;
    
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Weather API HTTP ${res.status}`);

    const json = await res.json();
    const current = json.current_weather;
    if (!current) throw new Error('No current_weather payload');

    const tempC = Math.round(current.temperature);
    const code = current.weathercode;

    const mapped = mapWMOToRegional(code, tempC, region);
    const result: WeatherInfo = {
      icon: mapped.icon,
      condition: mapped.condition,
      temp: `${tempC}°C`,
      flavor: mapped.flavor,
      isLive: true,
    };

    weatherCache[region] = { data: result, timestamp: now };
    return result;
  } catch (err) {
    console.warn(`[Weather API] Falling back to default for ${region}:`, err);
    return getFallbackWeather(region);
  }
}

export function getFallbackWeather(region: Region): WeatherInfo {
  const fallbacks: Record<Region, WeatherInfo> = {
    mumbai: { icon: '🔥', condition: 'आज खूप उकाडा आहे', temp: '32°C', flavor: 'पंख्याची हवा थंड वाटतेय', isLive: false },
    delhi: { icon: '❄️', condition: 'आज कड़ाके की ठंड है', temp: '14°C', flavor: 'गरम चाय और पुरानी यादें', isLive: false },
    chennai: { icon: '☀️', condition: 'இன்று பயங்கர வெயில்', temp: '35°C', flavor: 'ஃபேன் காற்றை இங்கு திருப்புங்கள்', isLive: false },
    kolkata: { icon: '🌧️', condition: 'আজ বৃষ্টি হচ্ছে', temp: '26°C', flavor: 'বাইরে জল জমে গেছে, দোকানে বসে গান শুনুন', isLive: false },
  };
  return fallbacks[region];
}
