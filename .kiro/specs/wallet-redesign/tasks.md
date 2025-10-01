# Implementation Plan

- [x] 1. Set up package data structures and interfaces

  - Create TypeScript interfaces for CoinPackage and payment configuration
  - Define COIN_PACKAGES constant array with the three package options
  - Create PAYMENT_CONFIG object with UPI and bank transfer details
  - _Requirements: 2.2, 2.3, 2.4, 4.1, 5.1_

- [x] 2. Update WalletModal component state management

  - Remove existing tab-related state (activeTab, amount)
  - Add selectedPackage state for tracking chosen package
  - Add selectedPaymentMethod state for payment method selection
  - Remove walletTransactions and related transaction state
  - _Requirements: 6.1, 6.2_

- [x] 3. Implement package selection UI component

  - Create PackageCard component for individual package display
  - Implement three-column layout for package selection
  - Add click handlers for package selection with visual feedback
  - Implement responsive design that stacks on mobile devices
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4. Create payment method selection component

  - Build PaymentMethodSelector component with UPI and Bank Transfer options
  - Add payment method icons and labels
  - Implement conditional rendering based on package selection
  - Add click handlers for payment method selection
  - _Requirements: 3.1, 3.4_

- [x] 5. Implement UPI payment details display

  - Create UPIPaymentDetails component
  - Add QR code image display with placeholder path
  - Include payment instructions and amount confirmation
  - Add confirm payment button with loading state
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Implement bank transfer payment details display

  - Create BankTransferDetails component
  - Display admin account number and IFSC code
  - Show payment amount and coin quantity
  - Add payment reference instructions and confirm button
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Update modal layout and remove old functionality

  - Remove tab navigation (Add Funds, Withdraw, History tabs)
  - Remove manual amount input field and related UI
  - Restructure modal content with new linear flow
  - Maintain existing modal header with balance display
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8. Implement payment confirmation logic

  - Add handlePaymentConfirmation function
  - Create API integration for payment processing
  - Update wallet balance after successful payment
  - Add success/error handling with user feedback
  - _Requirements: 4.4, 5.4_

- [ ] 9. Add responsive design and styling

  - Ensure package cards work on mobile devices
  - Test payment details display on different screen sizes
  - Maintain existing dark/light theme compatibility
  - Verify all new components follow existing design patterns
  - _Requirements: 6.4, 6.5_

- [ ] 10. Clean up unused code and optimize
  - Remove handleAddFunds and handleWithdraw functions
  - Remove transaction-related useEffect and API calls
  - Clean up unused imports and state variables
  - Optimize component re-renders and performance
  - _Requirements: 6.1, 6.2_
