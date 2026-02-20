# 🔐 Authentication & User Tracking Setup

This document explains how authentication and user tracking works in the Taste the World app.

## 📋 Overview

The app uses a **session-based authentication system** built on Convex:

- Users sign up/sign in with email and password
- Session tokens are stored securely in AsyncStorage
- All user data (pantry, shopping list, favorites, etc.) is linked to user IDs
- Premium purchases are tracked and linked to user accounts

## 🗄️ Database Schema

### Users Table

- `email` - User's email (unique)
- `passwordHash` - Hashed password (SHA-256, upgrade to bcrypt in production)
- `name` - User's display name
- `subscriptionType` - "free", "monthly", or "yearly"
- `subscriptionStartDate` - When premium started
- `subscriptionEndDate` - When premium expires

### Sessions Table

- `userId` - Reference to user
- `token` - Session token (64-character hex string)
- `expiresAt` - Token expiration timestamp (30 days)

### Purchases Table

- `userId` - Reference to user
- `subscriptionType` - "monthly" or "yearly"
- `amount` - Purchase amount in cents
- `transactionId` - Payment processor transaction ID
- `status` - "pending", "completed", "failed", or "refunded"

## 🔑 Authentication Flow

### 1. Sign Up

```typescript
const { signUp } = useAuth();
await signUp('user@example.com', 'password123', 'John Doe');
```

### 2. Sign In

```typescript
const { signIn } = useAuth();
await signIn('user@example.com', 'password123');
```

### 3. Check Authentication

```typescript
const { isAuthenticated, user, isPremium } = useAuth();
```

### 4. Sign Out

```typescript
const { signOut } = useAuth();
await signOut();
```

## 💳 Premium Purchase Tracking

When a user purchases premium:

1. **Frontend** calls `updateSubscription` mutation with:
   - User's session token
   - Subscription type ("monthly" or "yearly")
   - Transaction ID (from payment processor)
   - Amount (in cents)

2. **Backend**:
   - Updates user's subscription status
   - Creates a purchase record in `purchases` table
   - Sets subscription expiration date

3. **User data** is automatically linked via `userId`:
   - Pantry items
   - Shopping lists
   - Favorites
   - Recipe history

## 🔒 Security Notes

### Current Implementation (Development)

- Passwords are hashed with SHA-256
- Session tokens are 64-character random hex strings
- Tokens expire after 30 days

### Production Recommendations

1. **Upgrade password hashing** to bcrypt or Argon2
2. **Add rate limiting** to prevent brute force attacks
3. **Implement password reset** functionality
4. **Add email verification** before account activation
5. **Use HTTPS** for all API calls
6. **Implement refresh tokens** for better security
7. **Add 2FA** for premium accounts

## 📱 Using Auth in Components

### Example: Protected Component

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!isAuthenticated) {
    return <Text>Please sign in</Text>;
  }

  return <Text>Welcome, {user?.name}!</Text>;
}
```

### Example: Premium Feature Gate

```typescript
import { useAuth } from "@/hooks/useAuth";

function PremiumFeature() {
  const { isPremium, user } = useAuth();

  if (!isPremium) {
    return <Text>Upgrade to Premium to access this feature</Text>;
  }

  return <Text>Premium content here!</Text>;
}
```

## 🔄 Syncing Data with User ID

All Convex functions that need user data require a `token` parameter:

```typescript
// Example: Get pantry items
const pantryItems = useQuery(
  api.pantry.getPantryItems,
  token ? { userId: user._id } : 'skip'
);
```

The backend verifies the token and ensures the user can only access their own data.

## 🛒 Purchase Flow

1. User clicks "Upgrade to Premium" in Settings
2. User selects monthly/yearly plan
3. Payment is processed (Stripe, Apple Pay, etc.)
4. Frontend calls `updateSubscription` with transaction details
5. Backend:
   - Creates purchase record
   - Updates user subscription
   - Returns updated user object
6. Frontend updates local state

## 📊 Tracking User Activity

All user actions are automatically tracked via `userId`:

- **Pantry items** - `pantry.userId`
- **Shopping lists** - `shoppingList.userId`
- **Favorites** - `favorites.userId`
- **Recipe history** - `recipeHistory.userId`
- **Purchases** - `purchases.userId`

This allows you to:

- Show user-specific data
- Sync across devices
- Track user behavior
- Manage subscriptions

## 🚀 Next Steps

1. **Create Login/Signup screens** - UI for authentication
2. **Add password reset** - Email-based password recovery
3. **Integrate payment processor** - Stripe, RevenueCat, etc.
4. **Add email verification** - Verify email before activation
5. **Implement refresh tokens** - Better session management
6. **Add analytics** - Track user engagement

---

**Ready to use!** The authentication system is set up and ready. You just need to create the UI screens for login/signup.
