export interface BirthDetails {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    latitude: number;
    longitude: number;
  }
  
  export const calculateAshtakavarga = async (details: BirthDetails) => {
    // First try C# API
    try {
      const response = await fetch('http://localhost:5112/api/astrology/ashtakavarga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('C# API failed, falling back to Node backend');
    }
  
    // Fallback to Node.js backend
    const nodeResponse = await fetch('https://astroalert-backend-m1hn.onrender.com/api/horoscope', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    });
  
    if (!nodeResponse.ok) {
      throw new Error('Both calculation services failed');
    }
  
    return await nodeResponse.json();
  };
  