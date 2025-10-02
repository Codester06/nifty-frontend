import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockStocks } from '@/data/mock/mockStocks';
import { Stock } from '@/shared/types';

const MinimalStockDetail = () => {
  console.log('MinimalStockDetail component mounted');
  
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<Stock | null>(null);
  
  console.log('MinimalStockDetail - symbol:', symbol);

  useEffect(() => {
    console.log('MinimalStockDetail useEffect triggered, symbol:', symbol);
    
    try {
      console.log('Available stocks:', mockStocks.length);
      const foundStock = mockStocks.find(s => s.symbol === symbol);
      console.log('Found stock:', foundStock);
      
      if (foundStock) {
        setStock(foundStock);
        console.log('Stock set successfully');
      } else {
        console.log('Stock not found, available symbols:', mockStocks.map(s => s.symbol));
        navigate('/');
      }
    } catch (error) {
      console.error('Error in MinimalStockDetail useEffect:', error);
    }
  }, [symbol, navigate]);

  console.log('MinimalStockDetail render - stock:', stock);

  if (!stock) {
    console.log('MinimalStockDetail showing loading state');
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading stock details...</p>
          <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '8px' }}>
            Symbol: {symbol || 'undefined'}
          </p>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            ← Back
          </button>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            {stock.symbol}
          </h1>
          
          <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>
            {stock.name}
          </p>
          
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '8px'
          }}>
            ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          
          <div style={{ 
            fontSize: '18px',
            color: isPositive ? '#059669' : '#dc2626',
            fontWeight: '600'
          }}>
            {isPositive ? '+' : ''}₹{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </div>
        </div>

        {/* Basic Info */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '16px'
          }}>
            Stock Information
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Volume</p>
              <p style={{ color: '#111827', fontWeight: '600', margin: '0' }}>{stock.volume}</p>
            </div>
            
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Full Name</p>
              <p style={{ color: '#111827', fontWeight: '600', margin: '0' }}>{stock.fullName}</p>
            </div>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>Description</p>
            <p style={{ color: '#374151', lineHeight: '1.6', margin: '0' }}>
              {stock.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalStockDetail;