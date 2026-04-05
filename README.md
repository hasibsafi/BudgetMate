# BudgetMate

BudgetMate is a mobile budgeting app for couples built with Expo, React Native, and Firebase.

The app is designed around independent financial ownership per user: each person manages their own income, categories, fixed expenses, and transactions, while partner data is available in read-only mode for transparency.

## Highlights

- Email/password authentication with Firebase Auth
- Household linking flow (create or join via invite code)
- Personal budget ownership per user
- Read-only partner budget view
- Monthly budget snapshots and history
- Category-level tracking with progress indicators
- Transaction create, edit, and delete flows
- Rollover-aware monthly budget initialization

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Firebase Authentication
- Cloud Firestore
- Zustand

## Product Model

BudgetMate is intentionally not a shared-write budget ledger.

- A household connects two users.
- Each user owns and edits only their own financial records.
- Partner records can be viewed, but not edited.
- Household templates can seed initial categories, then each user evolves their own category structure independently.

## Current App Structure

- Auth flow: login, registration, onboarding
- Main tabs: Home, History, Settings
- Category details screen
- Transaction modal for add/edit workflows

Key directories:

- `app/` file-based routing and screens
- `src/components/` reusable UI and feature components
- `src/services/` Firebase and Firestore service layer
- `src/store/` Zustand state stores
- `src/utils/` date, budget, currency, and validation helpers
- `src/types/` shared TypeScript domain models

## Architecture Notes

The codebase follows a layered approach:

1. Screens and components handle rendering and interaction.
2. Zustand stores manage feature state and orchestration.
3. Firestore services encapsulate data access and mutations.
4. Utilities hold pure business calculations (for example, rollover/totals logic).

This keeps business logic out of presentation components and makes the app easier to test and maintain.

## Getting Started

### 1. Prerequisites

- Node.js 18+
- npm 9+
- Xcode (for iOS simulator)
- Expo CLI tooling available through `npx expo`
- A Firebase project with Authentication and Firestore enabled

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Set Firebase config values in:

- `src/services/firebase/config.ts`

Enable in Firebase Console:

- Authentication > Email/Password
- Firestore Database

### 4. Run locally

```bash
npm run start
```

Useful commands:

```bash
npm run ios
npm run android
npm run web
npm run lint
npm run typecheck
```

## Firestore Security and Data Ownership

The project includes Firestore rules in `firestore.rules` to enforce:

- Users can only write to their own records
- Household members can read partner data when linked
- Partner data remains read-only by rule-level write restrictions

Review and deploy rules before production.

## Deployment Readiness Checklist

- Move Firebase configuration to environment-driven values
- Validate all Firestore indexes required by your queries
- Rotate and secure any exposed credentials
- Add automated tests for critical budget calculations and transaction flows
- Add crash/error monitoring for production builds

## Roadmap Suggestions

- Push notifications for budget thresholds
- Enhanced month transition handling and reminders
- CSV export and richer reporting
- Improved onboarding templates and guided setup

## License

Proprietary. All rights reserved unless explicitly stated otherwise.
