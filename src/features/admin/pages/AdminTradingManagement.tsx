import React, { useEffect, useState } from 'react';

interface Trade {
  _id: string;
  tradeId: string;
  user: { _id: string; username?: string; email: string };
  asset: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  margin: number;
  status: 'Completed' | 'Pending' | 'Failed';
  totalValue: number;
  timestamp: string;
}

const AdminTradingManagement: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (actionFilter) params.append('action', actionFilter);
      const url = `/api/trades?${params.toString()}`;
      const token = localStorage.getItem('nifty-bulk-token');
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch trades');
      const data = await response.json();
      setTrades(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    // eslint-disable-next-line
  }, [search, statusFilter, actionFilter]);

  // Stats
  const totalTrades = trades.length;
  const totalVolume = trades.reduce((sum, t) => sum + (t.totalValue || 0), 0);
  const pendingTrades = trades.filter(t => t.status === 'Pending').length;
  const failedTrades = trades.filter(t => t.status === 'Failed').length;

  // Export CSV
  const handleExport = async () => {
    const token = localStorage.getItem('nifty-bulk-token');
    const response = await fetch('/api/trades/export', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trades.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl dark:text-white font-bold mb-2">Trading Management</h2>
      <p className="mb-6 text-gray-500">Monitor all trading activities and transactions</p>
      {/* {error && <div className="text-red-500 mb-4">{error}</div>} */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-8 shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by trade ID, user, or asset..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 border dark:text-white rounded w-full md:w-96"
          />
          <div className="flex gap-2 items-center">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2 dark:text-white py-2 border rounded"
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="px-2 dark:text-white py-2 border rounded"
            >
              <option value="">All Actions</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleExport}
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl dark: text-white font-bold">{totalTrades}</div>
            <div className="text-xs text-gray-500">Total Trades</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-600">₹{(totalVolume/100000).toFixed(2)}L</div>
            <div className="text-xs text-gray-500">Total Volume</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingTrades}</div>
            <div className="text-xs text-gray-500">Pending Trades</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-red-600">{failedTrades}</div>
            <div className="text-xs text-gray-500">Failed Trades</div>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-200 dark:text-white dark:bg-gray-700">
                <th className="px-4 dark:text-white py-2 text-left">TRADE DETAILS</th>
                <th className="px-4 dark:text-white py-2 text-left">USER</th>
                <th className="px-4 dark:text-white py-2 text-left">ASSET</th>
                <th className="px-4 dark:text-white py-2 text-left">ACTION</th>
                <th className="px-4 dark:text-white py-2 text-left">QUANTITY</th>
                <th className="px-4 dark:text-white py-2 text-left">PRICE</th>
                <th className="px-4 dark:text-white py-2 text-left">TOTAL VALUE</th>
                <th className="px-4 dark:text-white py-2 text-left">MARGIN</th>
                <th className="px-4 dark:text-white py-2 text-left">STATUS</th>
                <th className="px-4 dark:text-white py-2 text-left">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-8">Loading...</td></tr>
              ) : trades.length === 0 ? (
                <tr><td colSpan={10} className="text-center dark:text-white py-8">No trades found.</td></tr>
              ) : (
                trades.map(trade => (
                  <tr key={trade._id} className="border-b">
                    <td className="px-4 py-2 whitespace-nowrap">{trade.tradeId}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{trade.user?.username || trade.user?.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{trade.asset}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {trade.action === 'BUY' ? (
                        <span className="text-green-600 font-bold">↑ BUY</span>
                      ) : (
                        <span className="text-red-600 font-bold">↓ SELL</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{trade.quantity}</td>
                    <td className="px-4 py-2 whitespace-nowrap">₹{trade.price.toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">₹{trade.totalValue?.toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{trade.margin ? `${trade.margin}%` : '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {trade.status === 'Completed' ? (
                        <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-semibold">Completed</span>
                      ) : trade.status === 'Pending' ? (
                        <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-semibold">Pending</span>
                      ) : (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(trade.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTradingManagement; 