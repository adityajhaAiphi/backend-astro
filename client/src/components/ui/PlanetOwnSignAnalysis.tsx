'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PlanetSignStatus {
  [key: string]: string;
}

interface OwnSignResponse {
  Status: string;
  Payload: {
    IsPlanetInOwnSign: PlanetSignStatus[];
  }
}

const planetInfo = {
  Sun: { icon: "☉", color: "text-amber-500", name: "Sun", ruler: "Leo" },
  Moon: { icon: "☽", color: "text-slate-300", name: "Moon", ruler: "Cancer" },
  Mars: { icon: "♂", color: "text-red-500", name: "Mars", ruler: "Aries/Scorpio" },
  Mercury: { icon: "☿", color: "text-green-500", name: "Mercury", ruler: "Gemini/Virgo" },
  Jupiter: { icon: "♃", color: "text-yellow-500", name: "Jupiter", ruler: "Sagittarius/Pisces" },
  Venus: { icon: "♀", color: "text-pink-500", name: "Venus", ruler: "Taurus/Libra" },
  Saturn: { icon: "♄", color: "text-blue-500", name: "Saturn", ruler: "Capricorn/Aquarius" },
  Rahu: { icon: "☊", color: "text-purple-500", name: "Rahu", ruler: "None" },
  Ketu: { icon: "☋", color: "text-indigo-500", name: "Ketu", ruler: "None" }
} as const;

type PlanetName = keyof typeof planetInfo;

export function PlanetOwnSignAnalysis() {
  const [results, setResults] = useState<OwnSignResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    location: '',
    time: '',
    date: '',
    timezone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const fetchOwnSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { location, time, date, timezone } = formData;
      
      if (!location || !time || !date || !timezone) {
        throw new Error('Please fill in all fields');
      }

      const formattedDate = formatDate(date);
      
      const url = `https://vedastro.azurewebsites.net/api/Calculate/IsPlanetInOwnSign/PlanetName/All/Location/${encodeURIComponent(location)}/Time/${time}/${formattedDate}/${timezone}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.Status !== "Pass") {
        throw new Error(data.Message || 'Failed to get planetary positions');
      }

      setResults(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-xl
                    border border-sacred-gold/20">
      <div className="mb-12 text-center relative">
        <h2 className="text-3xl font-bold text-sacred-copper mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper">
            Planetary Dignity Analysis
          </span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Analyze planets in their own signs for maximum strength
        </p>
      </div>

      <form onSubmit={fetchOwnSign} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. New Delhi, India"
              className="w-full p-3 border border-sacred-gold/30 rounded-lg bg-white/50 backdrop-blur-sm
                       focus:ring-2 focus:ring-sacred-gold/50 focus:border-sacred-gold
                       transition-all duration-300"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full p-3 border border-sacred-gold/30 rounded-lg bg-white/50 backdrop-blur-sm
                       focus:ring-2 focus:ring-sacred-gold/50 focus:border-sacred-gold
                       transition-all duration-300"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-3 border border-sacred-gold/30 rounded-lg bg-white/50 backdrop-blur-sm
                       focus:ring-2 focus:ring-sacred-gold/50 focus:border-sacred-gold
                       transition-all duration-300"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Timezone</label>
            <input
              type="text"
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              placeholder="e.g. +05:30"
              className="w-full p-3 border border-sacred-gold/30 rounded-lg bg-white/50 backdrop-blur-sm
                       focus:ring-2 focus:ring-sacred-gold/50 focus:border-sacred-gold
                       transition-all duration-300"
              required
            />
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-8 py-3 rounded-lg text-white font-semibold
                     bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper
                     hover:shadow-lg hover:shadow-sacred-gold/20 hover:scale-105
                     hover:cursor-pointer active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300 relative z-50"
          >
            <span className="relative z-50">
              {loading ? 'Analyzing...' : 'Check Planetary Dignity'}
            </span>
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-sacred-copper">Analyzing planetary positions...</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-center">
          {error}
        </div>
      )}

      {results?.Status === "Pass" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.Payload.IsPlanetInOwnSign.map((planetData, index) => {
              const planetName = Object.keys(planetData)[0] as PlanetName;
              const isInOwnSign = planetData[planetName] === "True";
              
              return (
                <div key={index} className="bg-white/90 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-2xl ${planetInfo[planetName].color}`}>
                      {planetInfo[planetName].icon}
                    </span>
                    <h3 className="font-semibold text-gray-700">{planetInfo[planetName].name}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${isInOwnSign ? 'text-green-500' : 'text-gray-500'}`}>
                        {isInOwnSign ? 'In Own Sign' : 'Not in Own Sign'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Rules: {planetInfo[planetName].ruler}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
} 