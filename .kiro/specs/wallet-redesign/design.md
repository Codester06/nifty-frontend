# Design Document

## Overview

The redesigned WalletModal will provide a streamlined user experience focused on package-based coin purchases with integrated payment methods. The component will maintain the existing modal structure while simplifying the content to show balance, package selection, payment method choice, and payment details in a linear flow.

## Architecture

### Component Structure
```
WalletModal
├── Modal Container (existing)
├── Header with Balance Display
├── Package Selection Section
├── Payment Method Selection
└── Payment Details Display
```

### State Management
- `selectedPackage`: Currently selected coin package (null | 'package1' | 'package2' | 'package3')
- `selectedPaymentMethod`: Currently selected payment method (null | 'upi' | 'bank')
- `walletBalance`: Current user wallet balance (number)
- `walletLoading`: Loading state for balance fetch (boolean)
- `walletError`: Error state for API calls (string)

### Data Flow
1. Modal opens → Fetch wallet balance
2. User selects package → Enable payment method selection
3. User selects payment method → Show payment details
4. User completes payment → Handle payment confirmation

## Components and Interfaces

### Package Interface
```typescript
interface CoinPackage {
  id: 'package1' | 'package2' | 'package3';
  price: number;
  coins: number;
  label: string;
}
```

### Package Data
```typescript
const COIN_PACKAGES: CoinPackage[] = [
  { id: 'package1', price: 10000, coins: 100000, label: '1 Lakh Coins' },
  { id: 'package2', price: 25000, coins: 500000, label: '5 Lakh Coins' },
  { id: 'package3', price: 50000, coins: 1000000, label: '10 Lakh Coins' }
];
```

### Payment Method Interface
```typescript
interface PaymentMethod {
  id: 'upi' | 'bank';
  label: string;
  icon: React.ComponentType;
}
```

### Payment Configuration
```typescript
const PAYMENT_CONFIG = {
  upi: {
    qrCodePath: '/assets/upi-qr-code.png', // To be provided by user
    instructions: 'Scan QR code with any UPI app to pay'
  },
  bank: {
    accountNumber: 'ADMIN_ACCOUNT_NUMBER', // To be configured
    ifscCode: 'ADMIN_IFSC_CODE', // To be configured
    accountName: 'Admin Account Name',
    instructions: 'Transfer to the above account and confirm payment'
  }
};
```

## Data Models

### Updated WalletModal Props
```typescript
interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Component State
```typescript
interface WalletModalState {
  selectedPackage: CoinPackage | null;
  selectedPaymentMethod: 'upi' | 'bank' | null;
  walletBalance: number;
  walletLoading: boolean;
  walletError: string;
  paymentConfirming: boolean;
}
```

## UI Layout Design

### Section 1: Balance Display (Existing)
- Keep current gradient card design
- Display wallet balance prominently
- Maintain responsive styling

### Section 2: Package Selection
```
[Package 1]    [Package 2]    [Package 3]
₹10,000        ₹25,000        ₹50,000
1L Coins       5L Coins       10L Coins
```
- Three cards in horizontal layout
- Each card shows price and coin amount
- Selected state with border/background highlight
- Responsive: Stack vertically on mobile

### Section 3: Payment Method Selection
```
[UPI Payment]    [Bank Transfer]
```
- Two payment option buttons
- Only visible after package selection
- Icons for each payment method

### Section 4: Payment Details
**UPI Selected:**
```
QR Code Image
"Scan with any UPI app"
Amount: ₹X for Y coins
[Confirm Payment] button
```

**Bank Transfer Selected:**
```
Account: XXXX-XXXX-XXXX
IFSC: XXXXXXXX
Amount: ₹X for Y coins
"Transfer and confirm payment"
[Confirm Payment] button
```

## Error Handling

### API Error Handling
- Network errors: Show retry option
- Authentication errors: Redirect to login
- Server errors: Display user-friendly message

### Validation
- Package selection: Required before payment method
- Payment method: Required before showing details
- Payment confirmation: Prevent double submission

### User Feedback
- Loading states during API calls
- Success messages after payment confirmation
- Error messages with clear actions

## Testing Strategy

### Unit Tests
- Package selection logic
- Payment method switching
- State management
- Error handling scenarios

### Integration Tests
- API integration for balance fetching
- Payment confirmation flow
- Modal open/close behavior

### Visual Tests
- Package card layouts
- Payment method display
- Responsive design
- Dark/light theme compatibility

### User Acceptance Tests
- Complete purchase flow
- Payment method switching
- Error recovery scenarios
- Mobile responsiveness

## Implementation Notes

### Styling Approach
- Maintain existing Tailwind CSS classes
- Keep current dark/light theme support
- Ensure responsive design principles
- Use existing color scheme and gradients

### Performance Considerations
- Lazy load QR code image
- Optimize re-renders with proper state management
- Cache payment configuration data

### Accessibility
- Proper ARIA labels for package selection
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Security
- Validate payment amounts on backend
- Secure payment confirmation endpoints
- Prevent client-side manipulation of package prices