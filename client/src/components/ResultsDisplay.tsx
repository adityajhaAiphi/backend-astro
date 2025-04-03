'use client';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface ChartData {
  success: boolean;
  charts: {
    Sarvashtakavarga: Record<string, number>;
    [key: string]: Record<string, number>;
  };
  calculationDate: string;
}

export default function ResultsDisplay({ data }: { data: ChartData }) {
  console.log('Received data:', data); // Debug log
  console.log('Charts data:', data?.charts); // Add debug logging

  if (!data) {
    return <div>Loading...</div>;
  }

  if (!data?.charts) {
    console.error('Missing charts data:', data); // Debug log
    return <div>Error loading chart data</div>;
  }

  const planetaryCharts = Object.entries(data.charts)
    .filter(([planet]) => planet !== 'Sarvashtakavarga');
  
  console.log('Filtered planetary charts:', planetaryCharts); // Debug log
  console.log('Sample chart data:', planetaryCharts[0]); // Add debug log to see exact chart structure

  return (
    <div className="mt-8 space-y-8">
      {/* Sarvashtakavarga Section */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Sarvashtakavarga Chart</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.charts.Sarvashtakavarga && Object.entries(data.charts.Sarvashtakavarga).map(([sign, score]) => (
              <div key={sign} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                <div className="text-lg font-semibold text-gray-800">{sign}</div>
                <div className="text-2xl font-bold text-blue-600">{String(score)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Planetary Charts Section */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">
            Planetary Charts ({planetaryCharts.length})
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {planetaryCharts.map(([planet, chart]) => (
              <div key={planet} className="card bg-base-100 shadow-xl">
                <div className="card-body p-4">
                  <h3 className="card-title">{planet} Chart</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(chart).map(([sign, score], index) => (
                      <div key={`${planet}-${sign}-${index}`} 
                           className="stat bg-base-200 rounded-lg p-2">
                        <div className="stat-title">{sign}</div>
                        <div className="stat-value text-primary">{score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
