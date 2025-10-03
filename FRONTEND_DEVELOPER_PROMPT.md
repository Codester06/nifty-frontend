# 🎯 Frontend Developer Task: Implement Trading Interface

## 📋 Task Overview
Implement a complete buy/sell trading interface for stocks and options with wallet integration and portfolio management.

**IMPORTANT**: Before starting implementation, please check if any trading functionality is already implemented in the frontend. If there's existing code, review it first and identify what needs to be updated or completed. Only implement missing features or fix broken functionality. Move on to other tasks if trading is already working properly.

## 🔧 Backend APIs Ready
The backend provides comprehensive trading APIs at `http://localhost:5001`. All endpoints are documented and tested.

## 🚀 Key Endpoints to Implement

### **1. Wallet Balance (FIXED)**
```javascript
// Get current user's wallet balance
GET /api/coins/balance
Headers: { 'Authorization': 'Bearer {token}' }

Response: {
  "success": true,
  "data": {
    "balance": 50000.00,
    "userId": "user123",
    "timestamp": "2025-10-03T16:30:00.000Z"
  }
}
```

### **2. Stock Trading**
```javascript
// Buy Stock
POST /api/trading/buy
Headers: { 'Authorization': 'Bearer {token}', 'Content-Type': 'application/json' }
Body: {
  "asset": "RELIANCE",
  "quantity": 10,
  "price": 2500.50,
  "amount": 25005.00,
  "instrumentType": "stock"
}

// Sell Stock  
POST /api/trading/sell
Headers: { 'Authorization': 'Bearer {token}', 'Content-Type': 'application/json' }
Body: {
  "asset": "RELIANCE", 
  "quantity": 5,
  "price": 2520.00,
  "amount": 12600.00,
  "instrumentType": "stock"
}
```

### **3. Options Trading**
```javascript
// Buy Option
POST /api/trading/buy
Headers: { 'Authorization': 'Bearer {token}', 'Content-Type': 'application/json' }
Body: {
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

### **4. Portfolio & Validation**
```javascript
// Get Portfolio
GET /api/portfolio/
Headers: { 'Authorization': 'Bearer {token}' }

// Validate Order (before execution)
POST /api/trading/validate
Headers: { 'Authorization': 'Bearer {token}', 'Content-Type': 'application/json' }
Body: {
  "action": "BUY",
  "asset": "RELIANCE",
  "quantity": 10,
  "price": 2500.50,
  "amount": 25005.00,
  "instrumentType": "stock"
}
```

## 🎨 UI Requirements

### **Trading Interface Should Include:**
1. **Wallet Balance Display** - Show current balance prominently
2. **Order Form** with:
   - Buy/Sell toggle
   - Stock/Option selector
   - Asset symbol input
   - Quantity input
   - Price input
   - Total amount calculation
   - Validate button
   - Execute button

3. **Portfolio Section** showing:
   - Current positions
   - P&L for each position
   - Total portfolio value

4. **Order History** (optional for MVP)

### **Sample UI Flow:**
```
┌─────────────────────────────────────┐
│ Wallet Balance: ₹50,000.00          │
├─────────────────────────────────────┤
│ [BUY] [SELL]  [Stock] [Option]      │
│                                     │
│ Asset: [RELIANCE____________]       │
│ Qty:   [10_____]  Price: [2500.50] │
│ Total: ₹25,005.00                   │
│                                     │
│ [Validate Order] [Execute Order]    │
├─────────────────────────────────────┤
│ Portfolio:                          │
│ RELIANCE  10 shares  ₹2,500  +₹200  │
│ INFY      5 shares   ₹1,800  -₹100  │
└─────────────────────────────────────┘
```

## 🔒 Authentication
- Use JWT token from login response
- Include in Authorization header: `Bearer {token}`
- Handle 401 errors by redirecting to login

## ⚠️ Error Handling
Handle these common errors:
- `INSUFFICIENT_BALANCE` - Show "Insufficient wallet balance"
- `INVALID_REQUEST_DATA` - Show validation errors
- `OPTIONS_MARKET_CLOSED` - Show "Options market is closed"
- `UNAUTHORIZED` - Redirect to login

## 📝 Implementation Steps

### **Phase 1: Basic Setup**
1. Create trading component/page
2. Implement wallet balance display using `/api/coins/balance`
3. Create basic order form (stock trading only)
4. Add buy/sell functionality
5. Show success/error messages

### **Phase 2: Enhanced Features**
1. Add order validation before execution
2. Implement portfolio display
3. Add options trading support
4. Handle market status for options

### **Phase 3: Polish**
1. Add loading states
2. Improve error handling
3. Add confirmation dialogs
4. Implement real-time balance updates

## 🧪 Testing
Test with these sample data:
- **Stock**: RELIANCE, INFY, TCS, HDFC
- **Options**: NIFTY25DEC24000CE, BANKNIFTY25DEC50000PE
- **Quantities**: 1-100 for stocks, multiples of lot size for options
- **Prices**: Use realistic market prices

## 📚 Complete Documentation
Refer to `FRONTEND_TRADING_IMPLEMENTATION_GUIDE.md` for:
- Complete API documentation
- React component examples
- Error handling patterns
- Advanced features implementation

## 🎯 Success Criteria
- [ ] User can view wallet balance
- [ ] User can place buy orders for stocks
- [ ] User can place sell orders for stocks  
- [ ] User can view their portfolio
- [ ] Orders update wallet balance correctly
- [ ] Proper error handling for all scenarios
- [ ] Options trading works (bonus)

## 🚨 Critical Notes
1. **Wallet Balance**: Use `/api/coins/balance` (NOT `/api/coins/balance/{userId}`)
2. **Field Names**: Response uses `balance` field (NOT `walletBalance`)
3. **Authentication**: All trading endpoints require valid JWT token
4. **Validation**: Always validate orders before execution to prevent errors

Start with basic stock trading and expand to options once the core functionality works!

## 🔍 **Before You Start - Check Existing Implementation**

1. **Review existing frontend code** for any trading-related components
2. **Test current functionality** - does buy/sell already work?
3. **Check wallet balance display** - is it showing correctly now?
4. **Identify gaps** - what's missing or broken?
5. **If trading already works**, focus on other pending tasks instead

## 📞 **Instructions from Backend Team**

"I need you to implement a trading interface for buy/sell functionality. The backend APIs are ready and documented. Start with the `FRONTEND_DEVELOPER_PROMPT.md` file for the quick overview, then refer to `FRONTEND_TRADING_IMPLEMENTATION_GUIDE.md` for detailed examples. Focus on basic stock trading first, then add options trading. The wallet balance issue has been fixed - use the new `/api/coins/balance` endpoint. If trading functionality is already implemented, just check it works correctly and move on to other tasks."

The documentation includes everything you need: API endpoints, request formats, React examples, error handling, and a step-by-step implementation plan!