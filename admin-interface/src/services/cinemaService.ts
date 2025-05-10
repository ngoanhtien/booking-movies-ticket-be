import axios from 'axios';

// API Base URL - using relative path for proxy to work
const API_BASE_URL = '';

// Types
export interface City {
  id: string;
  name: string;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  imageUrl?: string;
  basePrice: number;
  priceVariations?: {
    weekend?: number; // Weekend surcharge percentage
    holiday?: number; // Holiday surcharge percentage 
    evening?: number; // Evening surcharge percentage (after 18:00)
    vip?: number; // VIP seat surcharge percentage
    couple?: number; // Couple seat surcharge percentage
  };
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
  date: string;
  availableSeats: number;
  isWeekend: boolean;
  isHoliday: boolean;
}

// Response normalization helper
const normalizeResponse = (responseData: any) => {
  console.log("Raw API response:", responseData);
  
  if (responseData.data) {
    return responseData.data;
  } else if (responseData.result) {
    return responseData.result;
  } else if (Array.isArray(responseData)) {
    return responseData;
  }
  
  console.warn("Unknown API response structure:", responseData);
  return [];
};

// Mock data - will be used until the backend API is ready
const mockCities: City[] = [
  { id: 'hcm', name: 'Hồ Chí Minh' },
  { id: 'hn', name: 'Hà Nội' },
  { id: 'dn', name: 'Đà Nẵng' },
  { id: 'ct', name: 'Cần Thơ' },
  { id: 'dl', name: 'Đà Lạt' }
];

const mockCinemas: { [key: string]: Cinema[] } = {
  hcm: [
    { 
      id: 'cgv-aeon-tanphu', 
      name: 'CGV Aeon Mall Tân Phú', 
      address: '30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú',
      imageUrl: 'https://www.cgv.vn/media/site/cache/3/980x415/top_images/2023/06/banner-top-cgv-tan-phu-vi-min_1.jpg',
      basePrice: 75000,
      priceVariations: {
        weekend: 20, // 20% more expensive on weekends
        holiday: 30, // 30% more expensive on holidays
        evening: 15, // 15% more expensive for evening shows
        vip: 30, // 30% more expensive for VIP seats
        couple: 50, // 50% more expensive for couple seats
      }
    },
    { 
      id: 'lotte-nvl', 
      name: 'Lotte Cinema Nguyễn Văn Lượng', 
      address: '65 Nguyễn Văn Lượng, Gò Vấp',
      imageUrl: 'https://cdn.galaxycine.vn/media/2019/5/6/lotte-cinema-nvl_1557134736833.jpg',
      basePrice: 70000,
      priceVariations: {
        weekend: 25,
        holiday: 35,
        evening: 15,
        vip: 35,
        couple: 60,
      }
    },
    { 
      id: 'bhd-vincom-thuduc', 
      name: 'BHD Star Vincom Thủ Đức', 
      address: '216 Võ Văn Ngân, Bình Thọ, Thủ Đức',
      imageUrl: 'https://cdn.galaxycine.vn/media/2019/5/6/bhd-star-vincom-thu-duc_1557134354411.jpg',
      basePrice: 80000,
      priceVariations: {
        weekend: 20,
        holiday: 25,
        evening: 10,
        vip: 30,
        couple: 45,
      }
    },
  ],
  hn: [
    { 
      id: 'cgv-vincom-ba-trieu', 
      name: 'CGV Vincom Bà Triệu', 
      address: '191 P. Bà Triệu, Lê Đại Hành, Hai Bà Trưng',
      imageUrl: 'https://static.mservice.io/cinema/momo-upload-api-210813103838-637644413181379820.jpg',
      basePrice: 85000,
      priceVariations: {
        weekend: 30,
        holiday: 40,
        evening: 20,
        vip: 40,
        couple: 60,
      }
    },
    { 
      id: 'lotte-long-bien', 
      name: 'Lotte Cinema Long Biên', 
      address: '7 Đ. Nguyễn Văn Linh, Gia Thụy, Long Biên',
      imageUrl: 'https://lh3.googleusercontent.com/p/AF1QipMoWTjXE_aBTdRlLIOXRUxj-H4zADZDoZULOlZM',
      basePrice: 75000,
      priceVariations: {
        weekend: 15,
        holiday: 25,
        evening: 10,
        vip: 25,
        couple: 40,
      }
    },
  ],
  dn: [
    { 
      id: 'cgv-vinh-trung', 
      name: 'CGV Vincom Đà Nẵng', 
      address: '255-257 Hùng Vương, Vĩnh Trung, Thanh Khê',
      imageUrl: 'https://static.mservice.io/cinema/momo-upload-api-210813103838-637644413181379820.jpg',
      basePrice: 70000,
      priceVariations: {
        weekend: 20,
        holiday: 30,
        evening: 15,
        vip: 30,
        couple: 50,
      }
    },
  ],
  ct: [
    { 
      id: 'cgv-sense-city', 
      name: 'CGV Sense City Cần Thơ', 
      address: '1 Đại lộ Hòa Bình, Tân An, Ninh Kiều',
      imageUrl: 'https://cdn.galaxycine.vn/media/2019/5/6/cgv-sense-city-can-tho_1557134459591.jpg',
      basePrice: 65000,
      priceVariations: {
        weekend: 15,
        holiday: 25,
        evening: 10,
        vip: 25,
        couple: 45,
      }
    },
  ],
  dl: [
    { 
      id: 'lotte-dalat', 
      name: 'Lotte Cinema Đà Lạt', 
      address: '01 Tran Quoc Toan, Ward 10, Da Lat',
      imageUrl: 'https://cdn.galaxycine.vn/media/2019/5/6/lotte-cinema-da-lat_1557134566330.jpg',
      basePrice: 65000,
      priceVariations: {
        weekend: 20,
        holiday: 30,
        evening: 10,
        vip: 25,
        couple: 40,
      }
    },
  ],
};

// Mock showtimes for different cinemas
const generateMockShowtimes = (cinemaId: string, movieId: string): Showtime[] => {
  const today = new Date();
  const showtimes: Showtime[] = [];
  
  // Generate showtimes for the next 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6; // 0 is Sunday, 6 is Saturday
    const isHoliday = false; // Setup some special holiday dates if needed
    
    // Add 4-6 showtimes per day
    const numShowtimes = 4 + Math.floor(Math.random() * 3);
    const startHours = [10, 12, 14, 16, 18, 20, 22];
    
    for (let i = 0; i < numShowtimes; i++) {
      const startHour = startHours[Math.floor(Math.random() * startHours.length)];
      startHours.splice(startHours.indexOf(startHour), 1); // Remove used hour
      
      const startTime = new Date(date);
      startTime.setHours(startHour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2); // Assuming all movies are 2 hours
      
      const isEvening = startHour >= 18;
      const basePrice = 75000; // You'd normally get this from the cinema data
      let price = basePrice;
      
      // Apply price variations
      if (isWeekend) price *= 1.2; // 20% more on weekends
      if (isHoliday) price *= 1.3; // 30% more on holidays
      if (isEvening) price *= 1.15; // 15% more in evenings
      
      showtimes.push({
        id: `st-${cinemaId}-${movieId}-${date.toISOString().split('T')[0]}-${startHour}`,
        movieId,
        cinemaId,
        roomId: `room-${1 + Math.floor(Math.random() * 5)}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        price: Math.round(price / 1000) * 1000, // Round to nearest 1000 VND
        date: date.toISOString().split('T')[0],
        availableSeats: 20 + Math.floor(Math.random() * 60),
        isWeekend,
        isHoliday
      });
    }
  }
  
  return showtimes;
};

// Mock APIs
export const fetchCities = async (): Promise<City[]> => {
  try {
    // Actual API call - uncomment when backend is ready
    // const response = await axios.get(`${API_BASE_URL}/cities`);
    // return normalizeResponse(response.data);
    
    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCities), 500);
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw new Error('Failed to fetch cities');
  }
};

export const fetchCinemasByCity = async (cityId: string): Promise<Cinema[]> => {
  try {
    // Actual API call - uncomment when backend is ready
    // const response = await axios.get(`${API_BASE_URL}/cinemas?cityId=${cityId}`);
    // return normalizeResponse(response.data);
    
    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCinemas[cityId] || []), 800);
    });
  } catch (error) {
    console.error(`Error fetching cinemas for city ${cityId}:`, error);
    throw new Error('Failed to fetch cinemas');
  }
};

export const fetchShowtimes = async (cinemaId: string, movieId: string, date?: string): Promise<Showtime[]> => {
  try {
    // Actual API call - uncomment when backend is ready
    // let url = `${API_BASE_URL}/showtimes?cinemaId=${cinemaId}&movieId=${movieId}`;
    // if (date) url += `&date=${date}`;
    // const response = await axios.get(url);
    // return normalizeResponse(response.data);
    
    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        const showtimes = generateMockShowtimes(cinemaId, movieId);
        if (date) {
          return resolve(showtimes.filter(st => st.date === date));
        }
        return resolve(showtimes);
      }, 800);
    });
  } catch (error) {
    console.error(`Error fetching showtimes:`, error);
    throw new Error('Failed to fetch showtimes');
  }
};

// This function calculates actual ticket price based on seat type and showtime
export const calculateTicketPrice = (
  showtime: Showtime, 
  cinema: Cinema, 
  seatType: 'regular' | 'vip' | 'couple' = 'regular'
): number => {
  let price = showtime.price; // Base price from showtime
  
  // Apply seat type variations
  if (seatType === 'vip' && cinema.priceVariations?.vip) {
    price *= (1 + cinema.priceVariations.vip / 100);
  } else if (seatType === 'couple' && cinema.priceVariations?.couple) {
    price *= (1 + cinema.priceVariations.couple / 100);
  }
  
  // Round to nearest 1000 VND
  return Math.round(price / 1000) * 1000;
}; 