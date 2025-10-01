# Implementation Plan

- [x] 1. Set up new directory structure and configuration

  - Create the new folder hierarchy according to the design
  - Update TypeScript configuration with path aliases
  - Update Vite configuration for path resolution
  - _Requirements: 1.1, 1.2, 5.1, 5.3_

- [x] 2. Configure path aliases and build tools

  - [x] 2.1 Update tsconfig.app.json with path mapping

    - Add baseUrl and paths configuration for clean imports
    - Configure aliases for @/components, @/features, @/shared, etc.
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.2 Update vite.config.ts with resolve aliases
    - Configure Vite to resolve the same path aliases
    - Ensure build and dev server use consistent paths
    - _Requirements: 5.1, 5.3_

- [x] 3. Reorganize core application files

  - [x] 3.1 Create app directory structure

    - Move App.tsx and main.tsx to src/app/
    - Create router.tsx for centralized routing
    - _Requirements: 1.1, 1.2_

  - [x] 3.2 Set up shared utilities and constants
    - Create src/shared directory structure
    - Move existing hooks to src/shared/hooks/
    - Create utils, constants, and services directories
    - _Requirements: 1.3, 2.1, 2.2_

- [x] 4. Reorganize UI components by category

  - [x] 4.1 Create component category directories

    - Create src/components/ui/, navigation/, forms/, charts/ directories
    - Set up index.ts files for each category
    - _Requirements: 1.1, 2.1, 4.3_

  - [x] 4.2 Move navigation components

    - Move Navbar, Footer to src/components/navigation/
    - Create proper component structure with index files
    - Update imports to use new paths
    - _Requirements: 1.1, 1.2, 5.1_

  - [x] 4.3 Move chart and trading components

    - Move StockChart, TradingViewWidget to src/components/charts/
    - Move TradingModal, StockCard to appropriate categories
    - Create index files for clean exports
    - _Requirements: 1.1, 2.1, 4.3_

  - [x] 4.4 Move form and modal components
    - Move WalletModal, UPIPaymentDetails to src/components/forms/
    - Organize payment-related components together
    - _Requirements: 1.1, 2.1_

- [x] 5. Create feature-based organization

  - [x] 5.1 Set up auth feature structure

    - Create src/features/auth/ with components, hooks, services, types
    - Move auth-related pages and components
    - Create feature index file
    - _Requirements: 2.1, 2.2, 4.1, 4.2_

  - [x] 5.2 Set up trading feature structure

    - Create src/features/trading/ structure
    - Move trading-related components and services
    - Organize stock-related functionality
    - _Requirements: 2.1, 2.2, 4.1_

  - [x] 5.3 Set up admin feature structure
    - Create src/features/admin/ structure
    - Move all admin pages and components
    - Organize admin-specific functionality
    - _Requirements: 2.1, 2.2, 4.1_

- [x] 6. Reorganize pages by logical groups

  - [x] 6.1 Create page category directories

    - Create src/pages/public/, auth/, dashboard/, legal/ directories
    - Set up index files for each category
    - _Requirements: 1.2, 1.3_

  - [x] 6.2 Move public pages

    - Move HomePage, AboutPage, SupportPage to src/pages/public/
    - Update routing and imports
    - _Requirements: 1.1, 1.2, 5.1_

  - [x] 6.3 Move auth pages

    - Move LoginPage, SignupPage variants to src/pages/auth/
    - Consolidate similar auth pages
    - _Requirements: 1.1, 1.2, 5.1_

  - [x] 6.4 Move dashboard and user pages
    - Move Dashboard, Profile, TransactionsPage to src/pages/dashboard/
    - Move legal pages to src/pages/legal/
    - _Requirements: 1.1, 1.2_

- [ ] 7. Create layout components

  - [ ] 7.1 Extract common layouts

    - Create MainLayout for general pages
    - Create AdminLayout for admin pages
    - Create AuthLayout for auth pages
    - _Requirements: 1.1, 2.1_

  - [ ] 7.2 Update pages to use layouts
    - Wrap page components with appropriate layouts
    - Remove duplicate layout code from pages
    - _Requirements: 2.1, 2.2_

- [ ] 8. Organize assets and styles

  - [ ] 8.1 Reorganize assets directory

    - Create subdirectories for images/logos/, images/icons/
    - Move existing assets to appropriate subdirectories
    - _Requirements: 1.3, 1.4_

  - [ ] 8.2 Set up styles directory
    - Create src/styles/ with globals.css, components.css
    - Move and organize CSS files
    - _Requirements: 1.3, 1.4_

- [-] 9. Update all imports and exports

  - [ ] 9.1 Create comprehensive index files

    - Add index.ts files to all component directories
    - Set up barrel exports for clean imports
    - _Requirements: 4.3, 5.2_

  - [x] 9.2 Update all import statements

    - Replace relative imports with absolute path aliases
    - Update all component imports throughout the app
    - _Requirements: 5.1, 5.3, 5.4_

  - [ ] 9.3 Update routing configuration
    - Update all route imports to use new paths
    - Ensure all pages are accessible after reorganization
    - _Requirements: 5.1, 5.3_

- [ ] 10. Consolidate and clean up types

  - [ ] 10.1 Organize types by domain

    - Move types to appropriate feature directories
    - Create shared types in src/shared/types/
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ] 10.2 Create type index files
    - Set up clean type exports
    - Remove duplicate type definitions
    - _Requirements: 4.3, 4.4_

- [ ]\* 11. Validate and test the reorganization

  - [ ]\* 11.1 Run build tests

    - Verify project builds successfully
    - Check for any missing imports or circular dependencies
    - _Requirements: All requirements_

  - [ ]\* 11.2 Test application functionality
    - Verify all routes work correctly
    - Test component rendering and functionality
    - Validate that all features work as expected
    - _Requirements: All requirements_
