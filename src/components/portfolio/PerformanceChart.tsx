import { useState, useEffect } from 'react';
import { portfolioService } from '@/features/portfolio/services/portfolioService';
import { PerformanceData } from '@/features/portfolio/types/portfolio';

const PerformanceChart = () => {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const performanceData = await portfolioService.getPerformanceData();
        setData(performanceData);
      } catch (err) {
        setError('Failed to fetch performance data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Performance</h2>
      <div style={{ height: '300px' }}>
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
            <linearGradient id="performance-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 60}
              x2="400"
              y2={i * 60}
              stroke="currentColor"
              strokeOpacity="0.1"
              className="text-gray-400"
            />
          ))}

          {/* Chart line */}
          <path
            d={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 400;
              const y = 300 - ((point.value - minValue) / range) * 250;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            stroke="#10b981"
            strokeWidth="3"
            fill="none"
          />

          {/* Fill area */}
          <path
            d={[
              ...data.map((point, index) => {
                const x = (index / (data.length - 1)) * 400;
                const y = 300 - ((point.value - minValue) / range) * 250;
                return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
              }),
              `L 400 300 L 0 300 Z`
            ].join(' ')}
            fill="url(#performance-gradient)"
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = 300 - ((point.value - minValue) / range) * 250;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#10b981"
                className="hover:r-6 transition-all cursor-pointer"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default PerformanceChart;
