# Requirements Document

## Introduction

This feature redesigns the existing WalletModal component to simplify the user experience by removing complex functionality and focusing on predefined package purchases with integrated payment methods. The new design will offer three fixed coin packages and two payment options (UPI and Bank Transfer) to streamline the wallet funding process.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see my current wallet balance clearly displayed, so that I can make informed decisions about purchasing coin packages.

#### Acceptance Criteria

1. WHEN the wallet modal opens THEN the system SHALL display the current wallet balance prominently at the top
2. WHEN the balance is displayed THEN the system SHALL format the amount in Indian Rupees (₹) with proper number formatting
3. WHEN the balance updates THEN the system SHALL reflect the new balance immediately in the display

### Requirement 2

**User Story:** As a user, I want to choose from predefined coin packages, so that I can quickly select the amount I want to purchase without manual input.

#### Acceptance Criteria

1. WHEN the modal opens THEN the system SHALL display three package options in a single horizontal row
2. WHEN displaying packages THEN the system SHALL show Package 1: ₹10,000 for 1 Lakh coins
3. WHEN displaying packages THEN the system SHALL show Package 2: ₹25,000 for 5 Lakh coins  
4. WHEN displaying packages THEN the system SHALL show Package 3: ₹50,000 for 10 Lakh coins
5. WHEN a user clicks on a package THEN the system SHALL highlight the selected package visually
6. WHEN a package is selected THEN the system SHALL enable the payment method selection

### Requirement 3

**User Story:** As a user, I want to select my preferred payment method, so that I can pay using either UPI or Bank Transfer based on my convenience.

#### Acceptance Criteria

1. WHEN a package is selected THEN the system SHALL display two payment method options: UPI and Bank Transfer
2. WHEN UPI is selected THEN the system SHALL display a QR code for payment
3. WHEN Bank Transfer is selected THEN the system SHALL display admin account number and IFSC code
4. WHEN a payment method is selected THEN the system SHALL show the relevant payment details clearly
5. WHEN payment details are shown THEN the system SHALL include the selected package amount and coin quantity

### Requirement 4

**User Story:** As a user, I want to see UPI QR code when I select UPI payment, so that I can scan and pay directly from my UPI app.

#### Acceptance Criteria

1. WHEN UPI payment method is selected THEN the system SHALL display a QR code image
2. WHEN QR code is displayed THEN the system SHALL show payment instructions
3. WHEN QR code is shown THEN the system SHALL display the package amount and coin quantity being purchased
4. WHEN QR code is displayed THEN the system SHALL provide a way to confirm payment completion

### Requirement 5

**User Story:** As a user, I want to see bank transfer details when I select Bank Transfer, so that I can transfer money directly from my banking app.

#### Acceptance Criteria

1. WHEN Bank Transfer payment method is selected THEN the system SHALL display admin account number
2. WHEN Bank Transfer is selected THEN the system SHALL display admin IFSC code
3. WHEN bank details are shown THEN the system SHALL display the package amount and coin quantity being purchased
4. WHEN bank details are displayed THEN the system SHALL provide a way to confirm payment completion
5. WHEN bank details are shown THEN the system SHALL include payment reference instructions

### Requirement 6

**User Story:** As a user, I want the interface to be clean and intuitive, so that I can complete my purchase quickly without confusion.

#### Acceptance Criteria

1. WHEN the modal opens THEN the system SHALL remove all previous tab functionality (Add Funds, Withdraw, History)
2. WHEN the modal is displayed THEN the system SHALL remove the manual amount input field
3. WHEN the interface loads THEN the system SHALL present a streamlined flow: Balance → Package Selection → Payment Method → Payment Details
4. WHEN any step is completed THEN the system SHALL provide clear visual feedback
5. WHEN the modal is open THEN the system SHALL maintain responsive design for different screen sizes