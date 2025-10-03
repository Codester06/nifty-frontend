import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { tradingService } from '../services/tradingService';
import type { Portfolio, PortfolioStock, PortfolioOption } from '../types';
import { getToken } from '../services/tradingService';
import { mockStocks } from '@/data/mock/mockStocks';

// Mock portfolio data for fallback
const mockPortfolio: Portfolio = {
  id: 'demo-portfolio-1',
  userId: 'demo-user',
  stocks: [
    {
      symbol: 'RELIANCE',
      quantity: 10,
      averagePrice: 2456.75,
      currentPrice: 2456.75,
      gainLoss: 110.75,
      gainLossPercent: 0.45,
      coinInvested: 24567.50,
      currentCoinValue: 24567.50,
      coinPnL: 110.75,
      coinPnLPercent: 0.45,
      entryDate: new Date('2024-01-15')
    },
    {
      symbol: 'TCS',
      quantity: 5,
      averagePrice: 3234.50,
      currentPrice: 3234.50,
      gainLoss: -67.50,
      gainLossPercent: -0.21,
      coinInvested: 16172.50,
      currentCoinValue: 16172.50,
      coinPnL: -67.50,
      coinPnLPercent: -0.21,
      entryDate: new Date('2024-01-20')
    },
    {
      symbol: 'HDFCBANK',
      quantity: 15,
      averagePrice: 1567.80,
      currentPrice: 1567.80,
      gainLoss: 234.00,
      gainLossPercent: 1.00,
      coinInvested: 23517.00,
      currentCoinValue: 23517.00,
      coinPnL: 234.00,
      coinPnLPercent: 1.00,
      entryDate: new Date('2024-01-10')
    }
  ],
  options: [
    {
      id: 'opt-1',
      symbol: 'RELIANCE24000CE',
      underlying: 'RELIANCE',
      strike: 24000,
      expiry: '2024-12-31',
      optionType: 'CE',
      quantity: 2,
      averagePrice: 45.20,
      currentPrice: 45.20,
      lotSize: 50,
      totalValue: 4520.00,
      investedValue: 4520.00,
      gainLoss: -4.00,
      gainLossPercent: -4.24,
      entryDate: '2024-01-25',
      status: 'OPEN',
      coinInvested: 4520.00,
      currentCoinValue: 4520.00,
      coinPnL: -4.00,
      coinPnLPercent: -4.24
    }
  ],
  totalValue: 68729.00,
  totalGainLoss: 273.25,
  totalGainLossPercent: 0.40,
  stocksValue: 64257.00,
  optionsValue: 4520.00,
  stocksGainLoss: 277.25,
  optionsGainLoss: -4.00,
  totalCoinsInvested: 68729.00,
  totalCoinValue: 68729.00,
  totalCoinPnL: 273.25,
  totalCoinPnLPercent: 0.40,
  stocksCoinValue: 64257.00,
  optionsCoinValue: 4520.00,
  stocksCoinPnL: 277.25,
  optionsCoinPnL: -4.00
};

interface OrderForm {
  asset: string;
  quantity: string;
  price: string;
  action: 'BUY' | 'SELL';
  instrumentType: 'stock' | 'option';
  orderType: 'market' | 'limit';
  limitPrice?: string;
  optionDetails?: {
    strike: number;
    expiry: string;
    optionType: 'CE' | 'PE';
    lotSize: number;
  };
}

const TradingPage: React.FC = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    asset: '',
    quantity: '',
    price: '',
    action: 'BUY',
    instrumentType: 'stock',
    orderType: 'market'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [marketStatus, setMarketStatus] = useState<{ open: boolean } | null>(null);
  const [activePortfolioTab, setActivePortfolioTab] = useState<'stocks' | 'options'>('stocks');

  const [filteredStocks, setFilteredStocks] = useState<typeof mockStocks>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Remove balance state and fetchBalance function, use user.walletBalance instead

  // Fetch portfolio
  const fetchPortfolio = useCallback(async () => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    setPortfolioLoading(true);
    setPortfolioError(null);

    try {
      const response = await fetch('/api/portfolio/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('fetchPortfolio response:', data);
      if (data.success) {
        setPortfolio(data.data);
      } else {
        console.warn('API returned error, using mock portfolio data');
        setPortfolio(mockPortfolio);
        setPortfolioError('Using demo portfolio data');
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      console.warn('API failed, using mock portfolio data');
      setPortfolio(mockPortfolio);
      setPortfolioError('Using demo portfolio data');
    } finally {
      setPortfolioLoading(false);
    }
  }, [user]);

  // Check market status for options
  const checkMarketStatus = useCallback(async () => {
    try {
      const status = await tradingService.getMarketStatus();
      setMarketStatus(status);
    } catch (error) {
      console.error('Error checking market status:', error);
    }
  }, []);

  // Execute trade
  const executeTrade = async () => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setMessage(null);

    try {
      // Calculate amount
      const amount =
        orderForm.orderType === 'limit' && orderForm.limitPrice
          ? parseFloat(orderForm.quantity) * parseFloat(orderForm.limitPrice)
          : parseFloat(orderForm.quantity) * parseFloat(orderForm.price);

      // Prepare request body
      const requestBody = {
        asset: orderForm.asset,
        quantity: parseInt(orderForm.quantity),
        price:
          orderForm.orderType === 'limit' && orderForm.limitPrice
            ? parseFloat(orderForm.limitPrice)
            : parseFloat(orderForm.price),
        amount: amount,
        instrumentType: orderForm.instrumentType,
        ...(orderForm.instrumentType === 'option' && orderForm.optionDetails
          ? { optionDetails: orderForm.optionDetails }
          : {})
      };

      // Choose endpoint based on action
      const endpoint = orderForm.action === 'BUY' ? '/api/trading/buy' : '/api/trading/sell';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `${orderForm.action} order executed successfully!` });
        // Refresh portfolio only (balance is from user context)
        fetchPortfolio();
        // Reset form
        setOrderForm({
          asset: '',
          quantity: '',
          price: '',
          action: 'BUY',
          instrumentType: 'stock',
          orderType: 'market'
        });
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Trade execution failed' });
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      setMessage({ type: 'error', text: 'Error executing trade' });
    } finally {
      setLoading(false);
    }
  };

  // Validate trade before execution
  const validateTrade = async () => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    setMessage(null);

    try {
      const amount =
        orderForm.orderType === 'limit' && orderForm.limitPrice
          ? parseFloat(orderForm.quantity) * parseFloat(orderForm.limitPrice)
          : parseFloat(orderForm.quantity) * parseFloat(orderForm.price);

      const requestBody = {
        action: orderForm.action,
        asset: orderForm.asset,
        quantity: parseInt(orderForm.quantity),
        price:
          orderForm.orderType === 'limit' && orderForm.limitPrice
            ? parseFloat(orderForm.limitPrice)
            : parseFloat(orderForm.price),
        amount: amount,
        instrumentType: orderForm.instrumentType,
        ...(orderForm.instrumentType === 'option' && orderForm.optionDetails
          ? { optionDetails: orderForm.optionDetails }
          : {})
      };

      const response = await fetch('/api/trading/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Trade validation passed! You can proceed with the order.' });
        return true;
      } else {
        setMessage({ type: 'error', text: data.error?.message || 'Validation failed' });
        return false;
      }
    } catch (error) {
      console.error('Error validating trade:', error);
      setMessage({ type: 'error', text: 'Error validating trade' });
      return false;
    }
  };

  useEffect(() => {
    fetchPortfolio();
    checkMarketStatus();
  }, [user, fetchPortfolio, checkMarketStatus]);

  const totalAmount =
    orderForm.orderType === 'limit' && orderForm.limitPrice
      ? parseFloat(orderForm.quantity || '0') * parseFloat(orderForm.limitPrice || '0')
      : parseFloat(orderForm.quantity || '0') * parseFloat(orderForm.price || '0');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Order Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:col-span-1">
        <h1 className="text-3xl font-bold mb-6">Trading Interface</h1>

        {/* Wallet Balance */}
        <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Wallet Balance</h2>
        <p className="text-2xl font-bold text-green-600">₹{user?.walletBalance?.toLocaleString() || 0}</p>
        </div>

        {/* Order Form */}
        <div>
          {/* Action, Instrument Type, and Order Type */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Action</label>
              <select
                value={orderForm.action}
                onChange={(e) => setOrderForm({ ...orderForm, action: e.target.value as 'BUY' | 'SELL' })}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instrument Type</label>
              <select
                value={orderForm.instrumentType}
                onChange={(e) => setOrderForm({ ...orderForm, instrumentType: e.target.value as 'stock' | 'option' })}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="stock">Stock</option>
                <option value="option">Option</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Order Type</label>
              <select
                value={orderForm.orderType}
                onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value as 'market' | 'limit' })}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="market">Market</option>
                <option value="limit">Limit</option>
              </select>
            </div>
          </div>

          {/* Options Trading Section */}
          {orderForm.instrumentType === 'option' && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-700">
              <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-2">
                Options Trading
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Market Status: {marketStatus ? (marketStatus.open ? 'OPEN' : 'CLOSED') : 'Checking...'}
                </p>
                <button
                  onClick={checkMarketStatus}
                  className="px-3 py-1 bg-yellow-400 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 rounded-md hover:bg-yellow-500 dark:hover:bg-yellow-700 transition text-sm"
                >
                  Refresh
                </button>
              </div>
              {!marketStatus?.open && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                  ⚠️ Options market is closed. Trading hours: 09:15 AM - 03:30 PM IST
                </p>
              )}
            </div>
          )}

          {/* Asset Symbol */}
          <div className="mb-4 relative">
            <label className="block text-sm font-medium mb-2">Asset Symbol</label>
            <input
              type="text"
              placeholder="e.g., RELIANCE"
              value={orderForm.asset}
              onChange={(e) => {
                const input = e.target.value.toUpperCase();
                setOrderForm({ ...orderForm, asset: input });
                if (input.length > 0) {
                  const filtered = mockStocks.filter(stock =>
                    stock.symbol.startsWith(input)
                  );
                  setFilteredStocks(filtered);
                  setShowSuggestions(true);
                } else {
                  setShowSuggestions(false);
                }
              }}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              autoComplete="off"
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              onFocus={() => {
                if (orderForm.asset.length > 0) {
                  const filtered = mockStocks.filter(stock =>
                    stock.symbol.startsWith(orderForm.asset)
                  );
                  setFilteredStocks(filtered);
                  setShowSuggestions(true);
                }
              }}
            />
            {showSuggestions && filteredStocks.length > 0 && (
              <ul className="absolute z-10 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg mt-1">
                {filteredStocks.map((stock) => (
                  <li
                    key={stock.symbol}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                    onMouseDown={() => {
                      setOrderForm({
                        ...orderForm,
                        asset: stock.symbol,
                        price: stock.price.toString()
                      });
                      setShowSuggestions(false);
                    }}
                  >
                    {stock.symbol} - {stock.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <input
                type="number"
                placeholder="Quantity"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {orderForm.orderType === 'limit' ? 'Limit Price' : 'Price'} per unit
              </label>
              <input
                type="number"
                step="0.01"
                placeholder={orderForm.orderType === 'limit' ? 'Limit Price' : 'Price'}
                value={orderForm.orderType === 'limit' ? orderForm.limitPrice || '' : orderForm.price}
                onChange={(e) => {
                  if (orderForm.orderType === 'limit') {
                    setOrderForm({ ...orderForm, limitPrice: e.target.value });
                  } else {
                    setOrderForm({ ...orderForm, price: e.target.value });
                  }
                }}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                min="0.01"
              />
            </div>
          </div>

          {/* Total Amount */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-lg font-semibold">Total Amount: ₹{totalAmount.toLocaleString()}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={validateTrade}
              disabled={loading || !orderForm.asset || !orderForm.quantity || !orderForm.price}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Validate Order
            </button>
            <button
              onClick={executeTrade}
              disabled={loading || !orderForm.asset || !orderForm.quantity || !orderForm.price}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `${orderForm.action} Order`}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Portfolio */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:col-span-2 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Portfolio</h2>

        {/* Tabs */}
        <div className="mb-4 flex space-x-4 border-b border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setActivePortfolioTab('stocks')}
            className={`px-4 py-2 font-semibold rounded-t-md ${activePortfolioTab === 'stocks' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Stocks
          </button>
          <button
            onClick={() => setActivePortfolioTab('options')}
            className={`px-4 py-2 font-semibold rounded-t-md ${activePortfolioTab === 'options' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Options
          </button>
        </div>

        {/* Portfolio Table */}
        <div className="overflow-x-auto flex-grow">
          {portfolioLoading ? (
            <p className="text-gray-500">Loading portfolio...</p>
          ) : portfolioError ? (
            <p className="text-red-500">{portfolioError}</p>
          ) : portfolio ? (
            activePortfolioTab === 'stocks' ? (
              portfolio.stocks && portfolio.stocks.length > 0 ? (
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b dark:border-gray-600">
                      <th className="text-left p-2">Symbol</th>
                      <th className="text-left p-2">Quantity</th>
                      <th className="text-left p-2">Avg Price</th>
                      <th className="text-left p-2">Current Value</th>
                      <th className="text-left p-2">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.stocks.map((stock: PortfolioStock, index: number) => (
                      <tr key={index} className="border-b dark:border-gray-600">
                        <td className="p-2">{stock.symbol}</td>
                        <td className="p-2">{stock.quantity}</td>
                        <td className="p-2">₹{stock.averagePrice.toFixed(2)}</td>
                        <td className="p-2">₹{stock.currentCoinValue.toFixed(2)}</td>
                        <td className={`p-2 ${stock.coinPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{stock.coinPnL.toFixed(2)} ({stock.coinPnLPercent.toFixed(2)}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No stock positions found</p>
              )
            ) : portfolio.options && portfolio.options.length > 0 ? (
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b dark:border-gray-600">
                    <th className="text-left p-2">Symbol</th>
                    <th className="text-left p-2">Quantity</th>
                    <th className="text-left p-2">Avg Price</th>
                    <th className="text-left p-2">Current Value</th>
                    <th className="text-left p-2">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.options.map((option: PortfolioOption, index: number) => (
                    <tr key={index} className="border-b dark:border-gray-600">
                      <td className="p-2">{option.symbol}</td>
                      <td className="p-2">{option.quantity}</td>
                      <td className="p-2">₹{option.averagePrice.toFixed(2)}</td>
                      <td className="p-2">₹{option.currentCoinValue.toFixed(2)}</td>
                      <td className={`p-2 ${option.coinPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{option.coinPnL.toFixed(2)} ({option.coinPnLPercent.toFixed(2)}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No option positions found</p>
            )
          ) : (
            <p className="text-gray-500">No portfolio data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingPage;
