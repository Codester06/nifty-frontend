import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DebugStockDetail = () => {
  console.log('🚀 DebugStockDetail component mounted');
  
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [debugStep, setDebugStep] = useState('initializing');
  const [error, setError] = useState<string | null>(null);
  
  console.log('📍 Symbol from params:', symbol);

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    setDebugStep('loading imports');
    
    try {
      // Test 1: Check if we can import mockStocks
      console.log('📦 Testing mockStocks import...');
      import('@/data/mock/mockStocks').then((module) => {
        console.log('✅ mockStocks imported successfully:', module.mockStocks?.length, 'stocks');
        setDebugStep('mockStocks loaded');
        
        if (symbol) {
          const foundStock = module.mockStocks.find((s: any) => s.symbol === symbol);
          console.log('🔍 Found stock:', foundStock);
          setDebugStep(foundStock ? 'stock found' : 'stock not found');
        }
      }).catch((err) => {
        console.error('❌ Failed to import mockStocks:', err);
        setError('Failed to import mockStocks: ' + err.message);
        setDebugStep('import error');
      });
      
      // Test 2: Check if we can import useAuth
      console.log('🔐 Testing useAuth import...');
      import('@/shared/hooks/useAuth').then((module) => {
        console.log('✅ useAuth imported successfully');
        setDebugStep('useAuth loaded');
      }).catch((err) => {
        console.error('❌ Failed to import useAuth:', err);
        setError('Failed to import useAuth: ' + err.message);
        setDebugStep('useAuth error');
      });
      
      // Test 3: Check if we can import StockChart
      console.log('📊 Testing StockChart import...');
      import('@/components/charts/StockChart').then((module) => {
        console.log('✅ StockChart imported successfully');
        setDebugStep('StockChart loaded');
      }).catch((err) => {
        console.error('❌ Failed to import StockChart:', err);
        setError('Failed to import StockChart: ' + err.message);
        setDebugStep('StockChart error');
      });
      
    } catch (err: any) {
      console.error('❌ Error in useEffect:', err);
      setError('Error in useEffect: ' + err.message);
      setDebugStep('useEffect error');
    }
  }, [symbol]);

  console.log('🎨 Rendering DebugStockDetail, step:', debugStep);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>
          🐛 Debug Stock Detail Page
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#374151', fontSize: '18px', marginBottom: '10px' }}>
            Current Status
          </h2>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f9fafb', 
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}>
            <strong>Step:</strong> {debugStep}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#374151', fontSize: '18px', marginBottom: '10px' }}>
            Parameters
          </h2>
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f9fafb', 
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}>
            <strong>Symbol:</strong> {symbol || 'undefined'}
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ color: '#dc2626', fontSize: '18px', marginBottom: '10px' }}>
              ❌ Error
            </h2>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca',
              borderRadius: '4px',
              color: '#dc2626'
            }}>
              {error}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#374151', fontSize: '18px', marginBottom: '10px' }}>
            Instructions
          </h2>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Open browser developer console (F12)</li>
            <li>Look for console logs starting with 🚀, 📍, 🔄, etc.</li>
            <li>Check if any imports are failing</li>
            <li>Report back what you see in the console</li>
          </ol>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default DebugStockDetail;