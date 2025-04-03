'use client';
import { useState } from 'react';
import { calculateAshtakavarga, BirthDetails } from '@/app/services/astrologyService';
import ResultsDisplay from './ResultsDisplay';

export default function AshtakavargaForm() {
  const [details, setDetails] = useState<BirthDetails>({
    year: 1990,
    month: 1,
    day: 1,
    hour: 6,
    minute: 0,
    second: 0,
    latitude: 28.6139,
    longitude: 77.2090
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await calculateAshtakavarga(details);
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Ashtakavarga Calculator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Year" value={details.year} 
            onChange={v => setDetails({...details, year: Number(v)})} />
          <InputField label="Month" value={details.month} 
            onChange={v => setDetails({...details, month: Number(v)})} />
          <InputField label="Day" value={details.day} 
            onChange={v => setDetails({...details, day: Number(v)})} />
          <InputField label="Hour" value={details.hour} 
            onChange={v => setDetails({...details, hour: Number(v)})} />
          <InputField label="Latitude" value={details.latitude} 
            onChange={v => setDetails({...details, latitude: Number(v)})} />
          <InputField label="Longitude" value={details.longitude} 
            onChange={v => setDetails({...details, longitude: Number(v)})} />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </form>

      {result && <ResultsDisplay data={result} />}
    </div>
  );
}

const InputField = ({ label, value, onChange }: { 
  label: string;
  value: number;
  onChange: (value: string) => void 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
    />
  </div>
);
