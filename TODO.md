# Trading Interface Implementation TODO

## Phase 1: Basic Stock Trading Setup ✅
- [x] Create TradingInterface component/page under src/features/trading/pages/
- [x] Implement wallet balance display using /api/coins/balance endpoint
- [x] Create buy/sell order form with:
  - Buy/Sell toggle
  - Stock selector
  - Asset symbol input
  - Quantity input
  - Price input
  - Total amount calculation
- [x] Add order validation button (calls /api/trading/validate)
- [x] Add execute order button (calls /api/trading/buy or /api/trading/sell)
- [x] Implement success/error message display with proper error handling

## Phase 2: Portfolio Integration ✅
- [x] Implement portfolio display using /api/portfolio/ endpoint
- [x] Show current positions with P&L calculations
- [x] Update balance and portfolio after successful trades

## Phase 3: Service Layer Updates ✅
- [x] Update tradingService.ts to replace mock methods with real API calls
- [x] Implement proper error handling for API responses
- [x] Add authentication headers to all trading API calls
- [x] Fix authentication token method name consistency
- [x] Improve error handling in TradingModal to show backend errors

## Phase 4: Options Trading Extension
- [x] Add options trading support to the order form
- [x] Implement options market status check
- [x] Add options order validation and execution
- [x] Create options trading hook if needed

## Phase 5: Polish and Testing
- [ ] Add loading states for all operations
- [ ] Implement confirmation dialogs for trades
- [ ] Add real-time balance updates
- [ ] Test with sample data (RELIANCE, INFY, etc.)
- [ ] Verify error handling for all documented error codes
