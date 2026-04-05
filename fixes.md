# BudgetMate — Plan vs Implementation Audit

Inconsistencies found by comparing every file in the codebase against `plan.md`.

---

## Critical: Broken / Non-Functional Features

### 1. Transaction edit mode is non-functional (`app/modals/transaction.tsx`)
- **Plan:** "transactionId present = edit mode" — should load existing transaction data and call `editTransaction`.
- **Actual:** Title changes to "Edit Transaction" but the form fields are empty (doesn't load existing data). `onSave` always calls `addTransaction` — never calls `editTransaction`. Edit mode creates a duplicate transaction instead of updating.
- **Fix:** When `transactionId` is present, load the existing transaction, populate amount/note fields, and call `editTransaction` on save (passing `oldAmount` and delta-based update).

### 2. Auth gate does not enforce onboarding (`app/_layout.tsx`)
- **Plan (§9 Edge Cases):** "User has no household → Show onboarding screen. Block access to main tabs."
- **Actual:** `_layout.tsx` only checks `isAuthenticated`. A user who signs up can skip onboarding and land on the home screen with no household, no settings, no categories — an empty broken state.
- **Fix:** After auth, load the user document and check `householdId`. If null, redirect to `/(auth)/onboarding` instead of `/(tabs)/home`.

### 3. Onboarding is single-step, missing category/expense setup (`app/(auth)/onboarding.tsx`)
- **Plan (§10 Phase 2 step 3):** "multi-step: create/join household → set income → set fixed expenses → set budget categories".
- **Actual:** Only one screen: household create/join + income. No UI to add fixed expenses or budget categories during onboarding. Users enter the app with zero categories.
- **Fix:** Add onboarding steps for initial fixed expenses and budget categories before navigating to home, OR redirect to settings after onboarding with a prompt to add categories.

---

## High: Missing or Incomplete Functionality

### 4. FixedExpenseManager has no CRUD (`src/components/settings/FixedExpenseManager.tsx`)
- **Plan (§4, §10 Phase 7):** "CRUD list for fixed expenses" — add, edit, delete fixed expense categories.
- **Actual:** Only renders `<Text>{category.name}</Text>` for each category. No add, edit, or delete controls.
- **Fix:** Add inputs/buttons to create new fixed categories (`addUserCategory`), edit existing (`updateUserCategory`), and delete (`deleteUserCategory`). When adding mid-month, also create a categorySnapshot for the current month.

### 5. CategoryManager has no CRUD (`src/components/settings/CategoryManager.tsx`)
- **Plan (§4, §10 Phase 7):** "CRUD list for personal categories" — add, edit, delete budgeted categories.
- **Actual:** Same stub — only shows category names with no interaction.
- **Fix:** Same pattern as FixedExpenseManager. When adding a category mid-month, create its snapshot for the current month with carryover = 0, spent = 0 (per §9 edge case).

### 6. Settings screen missing income editor (`app/(tabs)/settings.tsx`)
- **Plan (§10 Phase 7 step 5):** "When income changes, update current month doc."
- **Actual:** No income editor anywhere in settings. `monthlyIncome` can only be set during onboarding and never changed.
- **Fix:** Add an editable income row in Settings. On change, call `updateSettings(userId, { monthlyIncome })` and also update the current month document's `income` and `remaining` fields.

### 7. Settings screen missing currency selector (`app/(tabs)/settings.tsx`)
- **Plan (§10 Phase 7):** "Currency selector" listed as a settings feature. `src/utils/currency.ts` exports a `currencies` array.
- **Actual:** No currency selector in settings UI. Currency defaults to "USD" everywhere.
- **Fix:** Add a currency picker that calls `updateSettings(userId, { currency })` and passes the selected currency to all `formatCurrency` calls.

### 8. History screen can't drill into categories (`app/(tabs)/history.tsx`)
- **Plan (§10 Phase 7 step 2):** "browse past months, view frozen snapshots, drill into categories."
- **Actual:** `onSelect={() => undefined}` — tapping a category does nothing.
- **Fix:** Navigate to `category/[id]` with the selected month's data. Also need to pass the historical monthKey so transactions load from the correct month.

### 9. History screen missing month summary (`app/(tabs)/history.tsx`)
- **Plan (§10 Phase 7):** History should show the DashboardCard summary (income, fixed, spent, remaining) for the selected month.
- **Actual:** Only shows the CategoryList. No month summary data displayed.
- **Fix:** Load `getUserMonth` for the selected month and render a `DashboardCard` above the CategoryList.

### 10. Home screen missing pull-to-refresh (`app/(tabs)/home.tsx`)
- **Plan (§10 Phase 4 step 8):** "Implement pull-to-refresh."
- **Actual:** ScrollView has no `refreshControl`. User can't manually refresh data.
- **Fix:** Add `RefreshControl` to ScrollView that re-runs `loadMonth` / `loadCategories`.

### 11. Settings household section incomplete (`app/(tabs)/settings.tsx`)
- **Plan (§10 Phase 7):** "Household section (name, invite code, partner name)."
- **Actual:** Only shows `Partner: [partnerId]` (raw UID). No household name, no invite code displayed, no partner display name.
- **Fix:** Load the household document and display its name and invite code. Resolve the partner's display name from the user document (using `getUser(partnerId)`).

### 12. Settings sign-out uses a Switch toggle (`app/(tabs)/settings.tsx`)
- **Plan (§4):** Sign out should be an action, not a toggle.
- **Actual:** `<SettingsRow label="Sign Out" rightElement={<Switch value={false} onValueChange={signOut} />} />` — sign-out is triggered by flipping a switch, which is confusing UX.
- **Fix:** Use a `Button` with `variant="destructive"` for sign-out instead of a Switch.

---

## Medium: Logic / Data Flow Gaps

### 13. Category added mid-month doesn't create a snapshot
- **Plan (§9):** "Category added mid-month → Create categorySnapshot for current month with carryover = 0, spent = 0."
- **Actual:** `addUserCategory` in `categories.ts` only creates the category document. No snapshot is created for the current month.
- **Fix:** After adding a category, also create a `categorySnapshot` doc under the current month with carryover = 0, spent = 0, remaining = baseBudget.

### 14. Income change doesn't update current month
- **Plan (§10 Phase 7 step 5):** "When income changes, update current month doc."
- **Actual:** `updateUserSettings` only updates the settings document. The current month's `income` and `remaining` fields are stale.
- **Fix:** When `monthlyIncome` changes in settings, also update `users/{userId}/months/{currentMonthKey}` with the new income and recalculated remaining.

### 15. `budgetStore` missing `refreshTotals`
- **Plan (§5):** `refreshTotals(userId: string, monthKey: string): Promise<void>` listed in budgetStore interface.
- **Actual:** Not implemented. No way to recalculate month totals from snapshots without reloading.
- **Fix:** Add `refreshTotals` that recalculates `fixedTotal`, `variableSpent`, and `remaining` from current categorySnapshots and writes updated values to the month document.

### 16. `budgetStore` missing `loadCategorySnapshots` as separate function
- **Plan (§5):** `loadCategorySnapshots(userId, monthKey)` is a separate method.
- **Actual:** Snapshots are loaded inside `loadMonth`. No standalone function to reload snapshots independently.
- **Fix:** Extract `loadCategorySnapshots` as its own method so snapshots can be refreshed independently (e.g., after adding a category mid-month).

### 17. `householdStore.loadHousehold` doesn't load the household document
- **Plan (§5):** `loadHousehold` should populate `household` state with the Household object (name, inviteCode, etc.).
- **Actual:** Only loads members. `household` is always `null`. The household name and invite code are never fetched.
- **Fix:** Fetch the household document (`getDoc` on `households/{householdId}`) and set `household` state. Needed for settings display.

### 18. Partner name never resolved
- **Plan (§8):** Partner resolution should cache `partnerId` AND resolve the partner's display name.
- **Actual:** `householdStore` has `partnerName` state and `setPartnerName` method, but nothing ever calls `setPartnerName`. The partner's name is never fetched from their user document.
- **Fix:** In `loadHousehold`, after finding the partner member, call `getUser(partnerId)` and set `partnerName` from the result.

### 19. `authStore` stores `FirebaseUser` instead of app `User`
- **Plan (§5):** `user: User | null` — the app-level User type with `name`, `householdId`, etc.
- **Actual:** `firebaseUser: FirebaseUser | null` — the Firebase Auth user (only has `uid`, `email`). The app never loads the user document into state for easy access to `name` or `householdId`.
- **Fix:** After auth state changes, load the user document via `getUser(uid)` and store it in the auth store (or a dedicated user store). This is needed for the auth gate (checking householdId) and displaying the user's name.

### 20. `TransactionList` not grouped by date
- **Plan (§4):** "FlatList of TransactionItem grouped by date."
- **Actual:** FlatList renders transactions in query order with no date grouping or section headers.
- **Fix:** Group transactions by date and render with section headers (either using `SectionList` or manual grouping with date headers).

### 21. `TransactionItem` uses buttons instead of swipe actions
- **Plan (§4):** "swipe actions (edit/delete)" and "swipe-to-edit/delete."
- **Actual:** Edit and Delete are plain Pressable text links below the transaction, not swipe gestures.
- **Fix:** Implement swipe-to-reveal using `react-native-gesture-handler` Swipeable or a similar library. Alternatively, keep current behavior if swipe isn't desired, but note this diverges from the plan.

---

## Low: Minor Gaps / Polish

### 22. `getStatusColor` return type diverges
- **Plan (§4):** Returns `"green" | "yellow" | "red"` (semantic strings).
- **Actual:** Returns hex color strings from `colors` constant (e.g., `"#22A06B"`).
- **Impact:** Working correctly but differently — components receive colors directly rather than mapping semantic names. This is fine but diverges from the planned interface.

### 23. Empty feature index files
- Files: `src/features/auth/index.ts`, `src/features/budget/index.ts`, etc. (7 files)
- All export `{}` — empty stubs with no logic.
- **Fix:** Either populate with feature-level orchestration or remove the `src/features/` directory if not needed.

### 24. `useCurrentUserId` hook is unused
- `src/hooks/useCurrentUserId.ts` exports a hook but no screen imports it. Screens access `useAuthStore` directly.
- **Fix:** Either use the hook in screens for consistency or remove it.

### 25. No loading skeletons
- **Plan (§10 Phase 8 step 1):** "Add loading skeletons for all data-loading states."
- **Actual:** Only `_layout.tsx` shows an `ActivityIndicator` during auth loading. No skeletons anywhere.

### 26. No haptic feedback
- **Plan (§10 Phase 8 step 4):** "Add haptic feedback on key actions."
- **Actual:** `expo-haptics` is not in `package.json`. No haptic feedback anywhere.

### 27. Firestore listener cleanup not comprehensive
- **Plan (§10 Phase 8 step 9):** "ensure Firestore listeners unsubscribe on unmount."
- **Actual:** `budgetStore` has `cleanup()` which unsubscribes month/snapshot listeners. But `subscribeToUser` and `subscribeToUserCategories` are never used by any screen — screens use one-shot fetches.
- **Fix:** Wire up real-time subscriptions where appropriate, or remove unused subscription functions.

### 28. `deleteTransaction` service takes 5 params, plan says 4
- **Plan (§6):** `deleteTransaction(userId, transactionId, categoryId, amount)` — 4 params.
- **Actual:** `deleteTransaction(userId, transactionId, categoryId, amount, monthKey)` — extra `monthKey` param.
- **Impact:** Working but diverges from plan. The extra param avoids deriving monthKey internally, which is fine.

### 29. `rollover.ts` `calculateNewSnapshot` takes 4 params, plan says 3
- **Plan (§6):** `calculateNewSnapshot(category, previousSnapshot, rolloverEnabled)` — 3 params.
- **Actual:** Adds `overspendingEnabled` as 4th param.
- **Impact:** This is an improvement — the plan describes overspending logic in §9 but forgot to include the param in the function signature.

### 30. `FixedExpenseList` on home screen shows `categories`, not snapshots
- **Plan (§4, §10 Phase 4):** Fixed expenses shown on the home screen should show snapshot data (baseBudget from the month snapshot).
- **Actual:** `FixedExpenseList` receives `categories` (user categories), not fixed expense snapshots. It shows `category.baseBudget` which is the current template value, not the frozen snapshot value.
- **Fix:** Filter `categorySnapshots` by `type === "fixed"` and pass those to the fixed expense display, so frozen month values are shown rather than live category values.

---

## Summary

| Priority | Count | Description |
|----------|-------|-------------|
| Critical | 3 | Edit mode broken, no onboarding gate, incomplete onboarding flow |
| High | 9 | Missing CRUD in settings, missing income/currency editors, history drill-down, pull-to-refresh, household info |
| Medium | 9 | Mid-month category snapshots, income→month sync, missing store methods, partner name, date grouping |
| Low | 9 | Status color types, empty features dir, unused hook, skeletons, haptics, listener cleanup |
