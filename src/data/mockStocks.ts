import { Stock } from '../types/types';

// Live price simulation
let priceUpdateInterval: NodeJS.Timeout | null = null;
let subscribers: ((stocks: Stock[]) => void)[] = [];

export const mockStocks: Stock[] = [
  {
    symbol: 'RELIANCE',
    name: 'RELIANCE',
    fullName: 'Reliance Industries Ltd',
    price: 0.42,
    change: 45.30,
    changePercent: 1.91,
    volume: '6.4M',
    description: 'Reliance Industries Limited is an Indian multinational conglomerate company headquartered in Mumbai, Maharashtra, India. It is one of the most valuable companies by market value in India.'
  },
  {
    symbol: 'TCS',
    name: 'TCS',
    fullName: 'Tata Consultancy Services',
    price: 3890.75,
    change: -23.45,
    changePercent: -0.60,
    volume: '2.1M',
    description: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'INFY',
    name: 'INFY',
    fullName: 'Infosys Limited',
    price: 1654.30,
    change: 12.80,
    changePercent: 0.78,
    volume: '3.2M',
    description: 'Infosys Limited is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.'
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFCBANK',
    fullName: 'HDFC Bank Limited',
    price: 1421.65,
    change: -8.90,
    changePercent: -0.62,
    volume: '4.8M',
    description: 'HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICIBANK',
    fullName: 'ICICI Bank Limited',
    price: 1087.20,
    change: 15.75,
    changePercent: 1.47,
    volume: '5.6M',
    description: 'ICICI Bank Limited is an Indian multinational bank and financial services company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'BHARTIARTL',
    name: 'BHARTIARTL',
    fullName: 'Bharti Airtel Limited',
    price: 1234.80,
    change: 28.40,
    changePercent: 2.36,
    volume: '3.7M',
    description: 'Bharti Airtel Limited is an Indian multinational telecommunications services company based in New Delhi, India.'
  },
  {
    symbol: 'SBIN',
    name: 'SBIN',
    fullName: 'State Bank of India',
    price: 789.45,
    change: -12.60,
    changePercent: -1.57,
    volume: '8.2M',
    description: 'State Bank of India is an Indian multinational public sector bank and financial services statutory body headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'LT',
    name: 'LT',
    fullName: 'Larsen & Toubro Limited',
    price: 3567.90,
    change: 67.50,
    changePercent: 1.93,
    volume: '1.9M',
    description: 'Larsen & Toubro Limited is an Indian multinational engaged in technology, engineering, construction, manufacturing and financial services.'
  },
  {
    symbol: 'ASIANPAINT',
    name: 'ASIANPAINT',
    fullName: 'Asian Paints Limited',
    price: 3234.90,
    change: -28.50,
    changePercent: -0.87,
    volume: '1.2M',
    description: 'Asian Paints Limited is an Indian multinational paint company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'MARUTI',
    name: 'MARUTI',
    fullName: 'Maruti Suzuki India Limited',
    price: 11234.50,
    change: 156.80,
    changePercent: 1.41,
    volume: '0.8M',
    description: 'Maruti Suzuki India Limited is an Indian multinational automotive manufacturer headquartered in New Delhi, India.'
  },
  {
    symbol: 'HCLTECH',
    name: 'HCLTECH',
    fullName: 'HCL Technologies Limited',
    price: 1567.30,
    change: 23.45,
    changePercent: 1.52,
    volume: '2.1M',
    description: 'HCL Technologies Limited is an Indian multinational information technology services and consulting company.'
  },
  {
    symbol: 'AXISBANK',
    name: 'AXISBANK',
    fullName: 'Axis Bank Limited',
    price: 1098.75,
    change: -15.20,
    changePercent: -1.36,
    volume: '3.5M',
    description: 'Axis Bank Limited is an Indian banking and financial services company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'BAJFINANCE',
    name: 'BAJFINANCE',
    fullName: 'Bajaj Finance Limited',
    price: 7890.25,
    change: 89.50,
    changePercent: 1.15,
    volume: '1.1M',
    description: 'Bajaj Finance Limited is an Indian financial services company headquartered in Pune, Maharashtra, India.'
  },
  {
    symbol: 'WIPRO',
    name: 'WIPRO',
    fullName: 'Wipro Limited',
    price: 567.80,
    change: 5.60,
    changePercent: 1.00,
    volume: '4.2M',
    description: 'Wipro Limited is an Indian multinational corporation that provides information technology, consulting and business process services.'
  },
  {
    symbol: 'NESTLEIND',
    name: 'NESTLEIND',
    fullName: 'Nestle India Limited',
    price: 23456.75,
    change: -234.50,
    changePercent: -0.99,
    volume: '0.3M',
    description: 'Nestle India Limited is an Indian subsidiary of the Swiss multinational food and drink processing conglomerate corporation Nestle.'
  },
  {
    symbol: 'ULTRACEMCO',
    name: 'ULTRACEMCO',
    fullName: 'UltraTech Cement Limited',
    price: 8765.40,
    change: 123.60,
    changePercent: 1.43,
    volume: '0.7M',
    description: 'UltraTech Cement Limited is an Indian multinational cement company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'TITAN',
    name: 'TITAN',
    fullName: 'Titan Company Limited',
    price: 3456.80,
    change: -45.70,
    changePercent: -1.30,
    volume: '1.8M',
    description: 'Titan Company Limited is an Indian luxury goods company that primarily manufactures jewellery, watches and eyewear.'
  },
  {
    symbol: 'SUNPHARMA',
    name: 'SUNPHARMA',
    fullName: 'Sun Pharmaceutical Industries Limited',
    price: 1234.90,
    change: 18.75,
    changePercent: 1.54,
    volume: '2.9M',
    description: 'Sun Pharmaceutical Industries Limited is an Indian multinational pharmaceutical company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'POWERGRID',
    name: 'POWERGRID',
    fullName: 'Power Grid Corporation of India Limited',
    price: 234.56,
    change: 3.45,
    changePercent: 1.49,
    volume: '5.1M',
    description: 'Power Grid Corporation of India Limited is an Indian state-owned electric utilities company headquartered in Gurugram, Haryana, India.'
  },
  {
    symbol: 'NTPC',
    name: 'NTPC',
    fullName: 'NTPC Limited',
    price: 345.67,
    change: -4.20,
    changePercent: -1.20,
    volume: '6.8M',
    description: 'NTPC Limited is an Indian central public sector undertaking engaged in the business of generation of electricity and allied activities.'
  },
  {
    symbol: 'TECHM',
    name: 'TECHM',
    fullName: 'Tech Mahindra Limited',
    price: 1456.80,
    change: 25.40,
    changePercent: 1.78,
    volume: '2.3M',
    description: 'Tech Mahindra Limited is an Indian multinational information technology services and consulting company.'
  },
  {
    symbol: 'ONGC',
    name: 'ONGC',
    fullName: 'Oil and Natural Gas Corporation Limited',
    price: 234.50,
    change: -2.80,
    changePercent: -1.18,
    volume: '7.2M',
    description: 'Oil and Natural Gas Corporation Limited is an Indian multinational oil and gas company headquartered in New Delhi, India.'
  },
  {
    symbol: 'TATAMOTORS',
    name: 'TATAMOTORS',
    fullName: 'Tata Motors Limited',
    price: 567.90,
    change: 12.30,
    changePercent: 2.21,
    volume: '8.5M',
    description: 'Tata Motors Limited is an Indian multinational automotive manufacturing company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'TATASTEEL',
    name: 'TATASTEEL',
    fullName: 'Tata Steel Limited',
    price: 123.45,
    change: -1.85,
    changePercent: -1.48,
    volume: '9.1M',
    description: 'Tata Steel Limited is an Indian multinational steel-making company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'BAJAJFINSV',
    name: 'BAJAJFINSV',
    fullName: 'Bajaj Finserv Limited',
    price: 1678.90,
    change: 34.50,
    changePercent: 2.10,
    volume: '1.4M',
    description: 'Bajaj Finserv Limited is an Indian financial services company headquartered in Pune, Maharashtra, India.'
  },
  {
    symbol: 'HDFCLIFE',
    name: 'HDFCLIFE',
    fullName: 'HDFC Life Insurance Company Limited',
    price: 678.45,
    change: -8.90,
    changePercent: -1.29,
    volume: '3.7M',
    description: 'HDFC Life Insurance Company Limited is an Indian life insurance company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'BRITANNIA',
    name: 'BRITANNIA',
    fullName: 'Britannia Industries Limited',
    price: 4567.80,
    change: 67.20,
    changePercent: 1.49,
    volume: '0.9M',
    description: 'Britannia Industries Limited is an Indian multinational food products company headquartered in Kolkata, West Bengal, India.'
  },
  {
    symbol: 'COALINDIA',
    name: 'COALINDIA',
    fullName: 'Coal India Limited',
    price: 234.67,
    change: -3.45,
    changePercent: -1.45,
    volume: '8.9M',
    description: 'Coal India Limited is an Indian state-owned coal mining and refining corporation headquartered in Kolkata, West Bengal, India.'
  },
  {
    symbol: 'SBILIFE',
    name: 'SBILIFE',
    fullName: 'SBI Life Insurance Company Limited',
    price: 1345.60,
    change: 18.90,
    changePercent: 1.42,
    volume: '2.1M',
    description: 'SBI Life Insurance Company Limited is an Indian life insurance company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'DRREDDY',
    name: 'DRREDDY',
    fullName: 'Dr. Reddys Laboratories Limited',
    price: 5678.90,
    change: -78.50,
    changePercent: -1.36,
    volume: '1.3M',
    description: 'Dr. Reddys Laboratories Limited is an Indian multinational pharmaceutical company headquartered in Hyderabad, Telangana, India.'
  },
  {
    symbol: 'EICHERMOT',
    name: 'EICHERMOT',
    fullName: 'Eicher Motors Limited',
    price: 3456.70,
    change: 45.80,
    changePercent: 1.34,
    volume: '0.8M',
    description: 'Eicher Motors Limited is an Indian multinational automotive company headquartered in Gurugram, Haryana, India.'
  },
  {
    symbol: 'ADANIENT',
    name: 'ADANIENT',
    fullName: 'Adani Enterprises Limited',
    price: 2345.60,
    change: -34.50,
    changePercent: -1.45,
    volume: '3.2M',
    description: 'Adani Enterprises Limited is an Indian multinational conglomerate company headquartered in Ahmedabad, Gujarat, India.'
  },
  {
    symbol: 'JSWSTEEL',
    name: 'JSWSTEEL',
    fullName: 'JSW Steel Limited',
    price: 789.45,
    change: 12.30,
    changePercent: 1.58,
    volume: '4.7M',
    description: 'JSW Steel Limited is an Indian multinational steel company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'INDUSINDBK',
    name: 'INDUSINDBK',
    fullName: 'IndusInd Bank Limited',
    price: 1234.50,
    change: -18.70,
    changePercent: -1.49,
    volume: '2.8M',
    description: 'IndusInd Bank Limited is an Indian new generation bank headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'ADANIPORTS',
    name: 'ADANIPORTS',
    fullName: 'Adani Ports and Special Economic Zone Limited',
    price: 789.60,
    change: 11.40,
    changePercent: 1.47,
    volume: '3.9M',
    description: 'Adani Ports and Special Economic Zone Limited is an Indian port developer and operator headquartered in Ahmedabad, Gujarat, India.'
  },
  {
    symbol: 'TATACONSUM',
    name: 'TATACONSUM',
    fullName: 'Tata Consumer Products Limited',
    price: 890.45,
    change: -12.60,
    changePercent: -1.39,
    volume: '2.5M',
    description: 'Tata Consumer Products Limited is an Indian fast-moving consumer goods company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'GRASIM',
    name: 'GRASIM',
    fullName: 'Grasim Industries Limited',
    price: 1678.90,
    change: 23.50,
    changePercent: 1.42,
    volume: '1.7M',
    description: 'Grasim Industries Limited is an Indian multinational conglomerate company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'CIPLA',
    name: 'CIPLA',
    fullName: 'Cipla Limited',
    price: 1123.45,
    change: -15.80,
    changePercent: -1.39,
    volume: '3.1M',
    description: 'Cipla Limited is an Indian multinational pharmaceutical and biotechnology company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'HINDALCO',
    name: 'HINDALCO',
    fullName: 'Hindalco Industries Limited',
    price: 456.78,
    change: 6.90,
    changePercent: 1.53,
    volume: '5.4M',
    description: 'Hindalco Industries Limited is an Indian aluminium and copper manufacturing company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'DIVISLAB',
    name: 'DIVISLAB',
    fullName: 'Divis Laboratories Limited',
    price: 3456.80,
    change: -45.60,
    changePercent: -1.30,
    volume: '1.2M',
    description: 'Divis Laboratories Limited is an Indian pharmaceutical company headquartered in Hyderabad, Telangana, India.'
  },
  {
    symbol: 'APOLLOHOSP',
    name: 'APOLLOHOSP',
    fullName: 'Apollo Hospitals Enterprise Limited',
    price: 5678.90,
    change: 78.40,
    changePercent: 1.40,
    volume: '0.9M',
    description: 'Apollo Hospitals Enterprise Limited is an Indian multinational healthcare group headquartered in Chennai, Tamil Nadu, India.'
  },
  {
    symbol: 'HEROMOTOCO',
    name: 'HEROMOTOCO',
    fullName: 'Hero MotoCorp Limited',
    price: 2890.45,
    change: -38.70,
    changePercent: -1.32,
    volume: '1.6M',
    description: 'Hero MotoCorp Limited is an Indian multinational motorcycle and scooter manufacturer headquartered in New Delhi, India.'
  },
  {
    symbol: 'BAJAJ-AUTO',
    name: 'BAJAJ-AUTO',
    fullName: 'Bajaj Auto Limited',
    price: 4567.80,
    change: 56.90,
    changePercent: 1.26,
    volume: '1.1M',
    description: 'Bajaj Auto Limited is an Indian multinational two-wheeler and three-wheeler manufacturer headquartered in Pune, Maharashtra, India.'
  },
  {
    symbol: 'SHRIRAMFIN',
    name: 'SHRIRAMFIN',
    fullName: 'Shriram Finance Limited',
    price: 2345.60,
    change: -28.90,
    changePercent: -1.22,
    volume: '2.3M',
    description: 'Shriram Finance Limited is an Indian non-banking financial company headquartered in Chennai, Tamil Nadu, India.'
  },
  {
    symbol: 'LTIM',
    name: 'LTIM',
    fullName: 'LTIMindtree Limited',
    price: 5678.45,
    change: 67.80,
    changePercent: 1.21,
    volume: '1.4M',
    description: 'LTIMindtree Limited is an Indian multinational information technology services and consulting company.'
  },
  {
    symbol: 'BPCL',
    name: 'BPCL',
    fullName: 'Bharat Petroleum Corporation Limited',
    price: 345.67,
    change: -4.50,
    changePercent: -1.29,
    volume: '6.7M',
    description: 'Bharat Petroleum Corporation Limited is an Indian oil and gas company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'UPL',
    name: 'UPL',
    fullName: 'UPL Limited',
    price: 678.90,
    change: 8.90,
    changePercent: 1.33,
    volume: '4.2M',
    description: 'UPL Limited is an Indian multinational agrochemicals company headquartered in Mumbai, Maharashtra, India.'
  },
  {
    symbol: 'M&M',
    name: 'M&M',
    fullName: 'Mahindra & Mahindra Limited',
    price: 1456.80,
    change: -18.90,
    changePercent: -1.28,
    volume: '3.8M',
    description: 'Mahindra & Mahindra Limited is an Indian multinational automotive manufacturing corporation headquartered in Mumbai, Maharashtra, India.'
  }
];

// Live price updates
export const startLivePriceUpdates = (callback: (stocks: Stock[]) => void) => {
  subscribers.push(callback);
  
  if (!priceUpdateInterval) {
    priceUpdateInterval = setInterval(() => {
      mockStocks.forEach(stock => {
        // Simulate realistic price movements (±0.5% max change per update)
        const maxChange = stock.price * 0.005;
        const priceChange = (Math.random() - 0.5) * 2 * maxChange;
        const newPrice = Math.max(stock.price + priceChange, 1);
        
        const change = newPrice - stock.price;
        stock.price = newPrice;
        stock.change += change;
        stock.changePercent = (stock.change / (newPrice - stock.change)) * 100;
        
        // Update volume randomly
        const volumeNum = parseFloat(stock.volume.replace('M', ''));
        const newVolume = Math.max(volumeNum + (Math.random() - 0.5) * 0.1, 0.1);
        stock.volume = `${newVolume.toFixed(1)}M`;
      });
      
      subscribers.forEach(callback => callback([...mockStocks]));
    }, 2000); // Update every 2 seconds
  }
  
  return () => {
    subscribers = subscribers.filter(sub => sub !== callback);
    if (subscribers.length === 0 && priceUpdateInterval) {
      clearInterval(priceUpdateInterval);
      priceUpdateInterval = null;
    }
  };
};

export const generateChartData = (timeframe: '1D' | '1W' | '1M', basePrice: number = 2400) => {
  const dataPoints = timeframe === '1D' ? 78 : timeframe === '1W' ? 35 : 30; // More data points for smoother charts
  const labels = [];
  const data = [];
  
  let currentPrice = basePrice;
  const volatility = timeframe === '1D' ? 0.002 : timeframe === '1W' ? 0.01 : 0.03;
  
  for (let i = 0; i < dataPoints; i++) {
    if (timeframe === '1D') {
      const hour = Math.floor(i / 6) + 9; // Market hours 9 AM to 3:30 PM
      const minute = (i % 6) * 10;
      labels.push(`${hour}:${minute.toString().padStart(2, '0')}`);
    } else if (timeframe === '1W') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const dayIndex = Math.floor(i / 7);
      const timeInDay = (i % 7) * 0.5 + 9;
      labels.push(`${days[dayIndex]} ${Math.floor(timeInDay)}:${((timeInDay % 1) * 60).toString().padStart(2, '0')}`);
    } else {
      const date = new Date();
      date.setDate(date.getDate() - (30 - i));
      labels.push(date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
    }
    
    // More realistic price movement simulation
    const randomWalk = (Math.random() - 0.5) * 2;
    const trend = Math.sin(i / dataPoints * Math.PI * 2) * 0.3; // Add some trend
    const priceChange = (randomWalk + trend) * volatility * currentPrice;
    
    currentPrice = Math.max(currentPrice + priceChange, basePrice * 0.8);
    data.push(parseFloat(currentPrice.toFixed(2)));
  }
  
  return { labels, data };
};