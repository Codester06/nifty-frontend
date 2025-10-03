# 🚀 Frontend Trading Implementation Guide

## 📋 Overview

This guide provides everything needed to implement buy/sell trading functionality in the frontend. The backend provides comprehensive trading APIs for both stocks and options with proper validation, wallet management, and portfolio updates.

## 🎯 Available Trading Systems

### 1. **Regular Stock/Options Trading**

- **Base URL**: `/api/trading/`
- **Supports**: Stocks and Options
- **Features**: Buy/Sell orders, validation, wallet integration

### 2. **Advanced Options Trading**

- **Base URL**: `/api/options/`
- **Supports**: Options only
- **Features**: Greeks calculation, market status, option chains

## 🔧 API Endpoints Reference

### **Core Trading Endpoints**

| Method | Endpoint                      | Description                      |
| ------ | ----------------------------- | -------------------------------- |
| `POST` | `/api/trading/buy`            | Execute buy order                |
| `POST` | `/api/trading/sell`           | Execute sell order               |
| `POST` | `/api/trading/validate`       | Validate order without executing |
| `POST` | `/api/options/order`          | Place options order              |
| `POST` | `/api/options/order/validate` | Validate options order           |
| `GET`  | `/api/options/market/status`  | Check if options market is open  |

### **Supporting Endpoints**

| Method | Endpoint                         | Description             |
| ------ | -------------------------------- | ----------------------- |
| `GET`  | `/api/coins/balance`             | Get wallet balance      |
| `GET`  | `/api/portfolio/`                | Get user portfolio      |
| `GET`  | `/api/options/chain/:underlying` | Get option chain        |
| `POST` | `/api/options/greeks`            | Calculate option Greeks |

## 📝 Request/Response Formats

### **1. Stock Trading**

#### **Buy Stock Request**

```javascript
POST /api/trading/buy
Content-Type: application/json
Authorization: Bearer {token}

{
  "asset": "RELIANCE",
  "quantity": 10,
  "price": 2500.50,
  "amount": 25005.00,
  "instrumentType": "stock"
}
```

#### **Sell Stock Request**

```javascript
POST /api/trading/sell
Content-Type: application/json
Authorization: Bearer {token}

{
  "asset": "RELIANCE",
  "quantity": 5,
  "price": 2520.00,
  "amount": 12600.00,
  "instrumentType": "stock"
}
```

### **2. Options Trading**

#### **Buy Option Request**

```javascript
POST /api/trading/buy
Content-Type: application/json
Authorization: Bearer {token}

{
  "asset": "NIFTY25DEC24000CE",
  "quantity": 50,
  "price": 150.50,
  "amount": 7525.00,
  "instrumentType": "option",
  "optionDetails": {
    "strike": 24000,
    "expiry": "2025-12-25T15:30:00.000Z",
    "optionType": "CE",
    "premium": 150.50,
    "lotSize": 50
  }
}
```

#### **Advanced Options Order**

```javascript
POST /api/options/order
Content-Type: application/json
Authorization: Bearer {token}

{
  "symbol": "NIFTY25DEC24000CE",
  "underlying": "NIFTY",
  "strike": 24000,
  "expiry": "2025-12-25T15:30:00.000Z",
  "optionType": "CE",
  "quantity": 50,
  "lotSize": 50,
  "price": 150.50
}
```

### **3. Trade Validation**

#### **Validate Before Execution**

```javascript
POST /api/trading/validate
Content-Type: application/json
Authorization: Bearer {token}

{
  "action": "BUY",
  "asset": "RELIANCE",
  "quantity": 10,
  "price": 2500.50,
  "amount": 25005.00,
  "instrumentType": "stock"
}
```

## 🎨 Frontend Implementation Examples

### **React Trading Component**

```jsx
import React, { useState, useEffect } from "react";

const TradingInterface = ({ token }) => {
  const [balance, setBalance] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [orderForm, setOrderForm] = useState({
    asset: "",
    quantity: "",
    price: "",
    action: "BUY",
    instrumentType: "stock",
  });
  const [loading, setLoading] = useState(false);

  // Fetch wallet balance
  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/coins/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setBalance(data.data.balance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Fetch portfolio
  const fetchPortfolio = async () => {
    try {
      const response = await fetch("/api/portfolio/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPortfolio(data.data.positions || []);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  // Execute trade
  const executeTrade = async () => {
    setLoading(true);
    try {
      // Calculate amount
      const amount =
        parseFloat(orderForm.quantity) * parseFloat(orderForm.price);

      // Prepare request body
      const requestBody = {
        asset: orderForm.asset,
        quantity: parseInt(orderForm.quantity),
        price: parseFloat(orderForm.price),
        amount: amount,
        instrumentType: orderForm.instrumentType,
      };

      // Choose endpoint based on action
      const endpoint =
        orderForm.action === "BUY" ? "/api/trading/buy" : "/api/trading/sell";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        alert(`${orderForm.action} order executed successfully!`);
        // Refresh balance and portfolio
        fetchBalance();
        fetchPortfolio();
        // Reset form
        setOrderForm({
          asset: "",
          quantity: "",
          price: "",
          action: "BUY",
          instrumentType: "stock",
        });
      } else {
        alert(`Error: ${data.error.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Validate trade before execution
  const validateTrade = async () => {
    try {
      const amount =
        parseFloat(orderForm.quantity) * parseFloat(orderForm.price);

      const requestBody = {
        action: orderForm.action,
        asset: orderForm.asset,
        quantity: parseInt(orderForm.quantity),
        price: parseFloat(orderForm.price),
        amount: amount,
        instrumentType: orderForm.instrumentType,
      };

      const response = await fetch("/api/trading/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        alert("Trade validation passed! You can proceed with the order.");
        return true;
      } else {
        alert(`Validation failed: ${data.error.message}`);
        return false;
      }
    } catch (error) {
      alert(`Validation error: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchPortfolio();
  }, [token]);

  return (
    <div className="trading-interface">
      <div className="balance-section">
        <h3>Wallet Balance: ₹{balance.toLocaleString()}</h3>
      </div>

      <div className="order-form">
        <h3>Place Order</h3>

        <select
          value={orderForm.action}
          onChange={(e) =>
            setOrderForm({ ...orderForm, action: e.target.value })
          }
        >
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>

        <select
          value={orderForm.instrumentType}
          onChange={(e) =>
            setOrderForm({ ...orderForm, instrumentType: e.target.value })
          }
        >
          <option value="stock">Stock</option>
          <option value="option">Option</option>
        </select>

        <input
          type="text"
          placeholder="Asset Symbol (e.g., RELIANCE)"
          value={orderForm.asset}
          onChange={(e) =>
            setOrderForm({ ...orderForm, asset: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Quantity"
          value={orderForm.quantity}
          onChange={(e) =>
            setOrderForm({ ...orderForm, quantity: e.target.value })
          }
        />

        <input
          type="number"
          step="0.01"
          placeholder="Price per unit"
          value={orderForm.price}
          onChange={(e) =>
            setOrderForm({ ...orderForm, price: e.target.value })
          }
        />

        <div className="order-summary">
          <p>
            Total Amount: ₹
            {(
              parseFloat(orderForm.quantity || 0) *
              parseFloat(orderForm.price || 0)
            ).toLocaleString()}
          </p>
        </div>

        <div className="order-buttons">
          <button onClick={validateTrade} disabled={loading}>
            Validate Order
          </button>
          <button onClick={executeTrade} disabled={loading}>
            {loading ? "Processing..." : `${orderForm.action} Order`}
          </button>
        </div>
      </div>

      <div className="portfolio-section">
        <h3>Portfolio</h3>
        {portfolio.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Quantity</th>
                <th>Avg Price</th>
                <th>Current Value</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((position, index) => (
                <tr key={index}>
                  <td>{position.asset}</td>
                  <td>{position.quantity}</td>
                  <td>₹{position.averagePrice}</td>
                  <td>₹{position.currentValue}</td>
                  <td className={position.pnl >= 0 ? "profit" : "loss"}>
                    ₹{position.pnl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No positions found</p>
        )}
      </div>
    </div>
  );
};

export default TradingInterface;
```

### **Options Trading Hook**

```javascript
import { useState, useEffect } from "react";

export const useOptionsTrading = (token) => {
  const [marketStatus, setMarketStatus] = useState(null);
  const [optionChain, setOptionChain] = useState([]);

  // Check if options market is open
  const checkMarketStatus = async () => {
    try {
      const response = await fetch("/api/options/market/status");
      const data = await response.json();
      if (data.success) {
        setMarketStatus(data.data);
      }
    } catch (error) {
      console.error("Error checking market status:", error);
    }
  };

  // Get option chain
  const getOptionChain = async (underlying, expiry) => {
    try {
      const response = await fetch(
        `/api/options/chain/${underlying}?expiry=${expiry}`
      );
      const data = await response.json();
      if (data.success) {
        setOptionChain(data.data.optionChain);
      }
    } catch (error) {
      console.error("Error fetching option chain:", error);
    }
  };

  // Place options order
  const placeOptionsOrder = async (orderData) => {
    try {
      const response = await fetch("/api/options/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error placing options order:", error);
      throw error;
    }
  };

  // Calculate Greeks
  const calculateGreeks = async (greeksData) => {
    try {
      const response = await fetch("/api/options/greeks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(greeksData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error calculating Greeks:", error);
      throw error;
    }
  };

  useEffect(() => {
    checkMarketStatus();
  }, []);

  return {
    marketStatus,
    optionChain,
    checkMarketStatus,
    getOptionChain,
    placeOptionsOrder,
    calculateGreeks,
  };
};
```

## 🔒 Authentication & Error Handling

### **Authentication**

All trading endpoints require JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### **Error Handling**

```javascript
const handleApiResponse = async (response) => {
  const data = await response.json();

  if (!response.ok || !data.success) {
    // Handle different error types
    switch (data.error?.code) {
      case "INSUFFICIENT_BALANCE":
        throw new Error("Insufficient wallet balance");
      case "INVALID_REQUEST_DATA":
        throw new Error("Invalid order data");
      case "OPTIONS_MARKET_CLOSED":
        throw new Error("Options market is closed");
      case "UNAUTHORIZED":
        throw new Error("Please login again");
      default:
        throw new Error(data.error?.message || "Unknown error occurred");
    }
  }

  return data;
};
```

## 🎯 Implementation Checklist

### **Phase 1: Basic Trading**

- [ ] Implement wallet balance display
- [ ] Create buy/sell order form
- [ ] Add order validation
- [ ] Handle success/error responses
- [ ] Update balance after trades

### **Phase 2: Portfolio Management**

- [ ] Display user portfolio
- [ ] Show P&L calculations
- [ ] Add position management
- [ ] Implement trade history

### **Phase 3: Options Trading**

- [ ] Add options market status check
- [ ] Implement option chain display
- [ ] Create options order form
- [ ] Add Greeks calculation
- [ ] Handle options-specific validation

### **Phase 4: Advanced Features**

- [ ] Real-time price updates
- [ ] Order book display
- [ ] Advanced charting
- [ ] Risk management tools

## 🚨 Important Notes

1. **Market Hours**: Options trading is only available during market hours (9:15 AM - 3:30 PM IST)
2. **Validation**: Always validate orders before execution
3. **Balance Check**: Ensure sufficient wallet balance before buy orders
4. **Error Handling**: Implement comprehensive error handling for all scenarios
5. **Security**: Never store sensitive data in localStorage, use secure token storage

## 📞 Support

If you encounter any issues:

1. Check the browser network tab for API responses
2. Verify authentication token is valid
3. Ensure request format matches the examples above
4. Check server logs for detailed error information

This implementation guide provides everything needed to build a complete trading interface. Start with basic stock trading and gradually add options trading features.
