export interface CandlestickData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicatorData {
  timestamp: Date;
  value: number;
}

export interface MACDData {
  timestamp: Date;
  macd: number;
  signal: number;
  histogram: number;
}

export interface RSIData {
  timestamp: Date;
  rsi: number;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: CandlestickData[], period: number): TechnicalIndicatorData[] {
  const result: TechnicalIndicatorData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0);
    const average = sum / period;
    
    result.push({
      timestamp: data[i].timestamp,
      value: average
    });
  }
  
  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: CandlestickData[], period: number): TechnicalIndicatorData[] {
  const result: TechnicalIndicatorData[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for the first value
  let ema = data.slice(0, period).reduce((acc, item) => acc + item.close, 0) / period;
  result.push({
    timestamp: data[period - 1].timestamp,
    value: ema
  });
  
  // Calculate EMA for remaining values
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close * multiplier) + (ema * (1 - multiplier));
    result.push({
      timestamp: data[i].timestamp,
      value: ema
    });
  }
  
  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(data: CandlestickData[], period: number = 14): RSIData[] {
  const result: RSIData[] = [];
  
  if (data.length < period + 1) return result;
  
  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }
  
  // Calculate initial average gains and losses
  let avgGain = 0;
  let avgLoss = 0;
  
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  // Calculate RSI for the first period
  let rs = avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));
  
  result.push({
    timestamp: data[period].timestamp,
    rsi: rsi
  });
  
  // Calculate RSI for remaining periods using smoothed averages
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    
    rs = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
    
    result.push({
      timestamp: data[i + 1].timestamp,
      rsi: rsi
    });
  }
  
  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  data: CandlestickData[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): MACDData[] {
  const result: MACDData[] = [];
  
  // Calculate EMAs
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // Calculate MACD line
  const macdLine: TechnicalIndicatorData[] = [];
  const startIndex = Math.max(fastPeriod, slowPeriod) - 1;
  
  // Align the EMA arrays properly
  const minLength = Math.min(fastEMA.length, slowEMA.length);
  const fastStartOffset = slowPeriod - fastPeriod; // Offset to align arrays
  
  for (let i = 0; i < minLength; i++) {
    const fastIndex = i + Math.max(0, fastStartOffset);
    const slowIndex = i;
    
    if (fastIndex < fastEMA.length && slowIndex < slowEMA.length) {
      macdLine.push({
        timestamp: slowEMA[slowIndex].timestamp,
        value: fastEMA[fastIndex].value - slowEMA[slowIndex].value
      });
    }
  }
  
  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMAFromValues(macdLine, signalPeriod);
  
  // Combine MACD and signal lines
  const minResultLength = Math.min(macdLine.length, signalLine.length);
  const signalStartOffset = signalPeriod - 1;
  
  for (let i = 0; i < signalLine.length; i++) {
    const macdIndex = i + signalStartOffset;
    if (macdIndex < macdLine.length) {
      const macd = macdLine[macdIndex].value;
      const signal = signalLine[i].value;
      
      result.push({
        timestamp: macdLine[macdIndex].timestamp,
        macd: macd,
        signal: signal,
        histogram: macd - signal
      });
    }
  }
  
  return result;
}

/**
 * Helper function to calculate EMA from existing values
 */
function calculateEMAFromValues(data: TechnicalIndicatorData[], period: number): TechnicalIndicatorData[] {
  const result: TechnicalIndicatorData[] = [];
  const multiplier = 2 / (period + 1);
  
  if (data.length < period) return result;
  
  // Start with SMA for the first value
  let ema = data.slice(0, period).reduce((acc, item) => acc + item.value, 0) / period;
  result.push({
    timestamp: data[period - 1].timestamp,
    value: ema
  });
  
  // Calculate EMA for remaining values
  for (let i = period; i < data.length; i++) {
    ema = (data[i].value * multiplier) + (ema * (1 - multiplier));
    result.push({
      timestamp: data[i].timestamp,
      value: ema
    });
  }
  
  return result;
}

/**
 * Generate mock candlestick data for testing
 */
export function generateMockCandlestickData(
  basePrice: number, 
  periods: number, 
  timeframe: '1m' | '5m' | '15m' | '1h' | '1d' = '1d'
): CandlestickData[] {
  const data: CandlestickData[] = [];
  let currentPrice = basePrice;
  
  const getTimeIncrement = (tf: string, index: number): Date => {
    const now = new Date();
    switch (tf) {
      case '1m':
        return new Date(now.getTime() - (periods - index) * 60 * 1000);
      case '5m':
        return new Date(now.getTime() - (periods - index) * 5 * 60 * 1000);
      case '15m':
        return new Date(now.getTime() - (periods - index) * 15 * 60 * 1000);
      case '1h':
        return new Date(now.getTime() - (periods - index) * 60 * 60 * 1000);
      case '1d':
      default:
        return new Date(now.getTime() - (periods - index) * 24 * 60 * 60 * 1000);
    }
  };
  
  for (let i = 0; i < periods; i++) {
    const volatility = 0.02; // 2% volatility
    const trend = (Math.random() - 0.5) * 0.01; // Random trend
    
    const open = currentPrice;
    const change = (Math.random() - 0.5) * volatility * basePrice;
    const close = Math.max(0.01, open + change + (trend * basePrice));
    
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    data.push({
      timestamp: getTimeIncrement(timeframe, i),
      open: open,
      high: high,
      low: low,
      close: close,
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
    
    currentPrice = close;
  }
  
  return data;
}