import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockStocks } from '../data/mock/mockStocks';
import { Stock } from '@/shared/types';
import { StockChart } from '@/components/charts';

const TestStockDetail = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<Stock | null>(null);

  useEffect(() => {
    console.log('TestStockDetail mounted, symbol:', symbol);
    
    if (symbol) {
      const foundStock = mockStocks.find(s => s.symbol === symbol);
      console.log('Found stock:', foundStock);
      
      if (foundStock) {
        setStock(foundStock);
      } else {
        console.log('Stock not found, redirecting to home');
        navigate('/');
      }
    }
  }, [symbol, navigate]);

  console.log('Rendering TestStockDetail, stock:', stock);

  if (!stock) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading stock details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {stock.symbol} - {stock.name}
        </h1>
        
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6">
          <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            ₹{stock.price.toFixed(2)}
          </div>
          <div className={`text-lg ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Price Chart</h2>
          <StockChart
            symbol={stock.symbol}
            name={stock.name}
            currentPrice={stock.price}
            change={stock.change}
            changePercent={stock.changePercent}
            variant="detailed"
          />
        </div>
      </div>
    </div>
  );
};

export default TestStockDetail;