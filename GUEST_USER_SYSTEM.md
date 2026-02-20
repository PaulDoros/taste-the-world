# 👤 Guest User System

## Overview

The app allows users to **purchase premium subscriptions without logging in**. When they create an account later, their purchases and data are automatically linked.

## How It Works

### 1. **Guest Purchase Flow**

```typescript
import { useGuestPurchase } from '@/hooks/useGuestPurchase';

const { processPurchase } = useGuestPurchase();

// User purchases premium without login
await processPurchase('monthly', 'transaction-123', 499); // $4.99
```

The purchase is saved locally and will be linked when the user creates an account.

### 2. **Account Creation with Linking**

When a guest creates an account, their data is automatically linked:

```typescript
import { useAuth } from '@/hooks/useAuth';

const { signUp } = useAuth();

// Automatically links guest purchases and data
await signUp('user@example.com', 'password123', 'John Doe');
```

**What gets linked:**

- ✅ Premium purchases (subscription activated immediately)
- ✅ Favorite recipes
- ✅ Shopping list items
- ✅ Pantry items
- ✅ Recipe viewing history

### 3. **Social Login Support**

The system supports OAuth providers (Google, Apple, Facebook):

```typescript
// Structure ready for OAuth integration
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const signUpWithOAuth = useMutation(api.oauth.signUpWithOAuth);

await signUpWithOAuth({
  provider: 'google',
  oauthId: 'google-user-id',
  email: 'user@gmail.com',
  name: 'John Doe',
  guestPurchases: [...], // Link guest purchases
  guestData: {...},      // Link guest data
});
```

## Implementation Details

### Guest User Utility (`utils/guestUser.ts`)

- **`getGuestId()`** - Generate or retrieve guest ID
- **`saveGuestPurchase()`** - Save purchase for later linking
- **`saveGuestData()`** - Save favorites, shopping list, etc.
- **`clearGuestData()`** - Clear after successful linking
- **`hasPendingPurchases()`** - Check if user has pending purchases

### Convex Functions

#### `auth.signUp`

- Accepts `guestPurchases` and `guestData` parameters
- Automatically links purchases and data when creating account

#### `guest.linkGuestPurchases`

- Links guest purchases to user account
- Updates subscription status

#### `guest.linkGuestData`

- Links favorites, shopping list, pantry, recipe history

#### `oauth.signUpWithOAuth`

- OAuth signup with guest data linking
- Supports Google, Apple, Facebook

## User Experience

### Scenario 1: Guest Purchase → Create Account

1. User browses app as guest
2. User purchases premium subscription
3. Purchase saved locally
4. User creates account
5. **Purchase automatically linked** ✅
6. Premium features activated immediately

### Scenario 2: Guest Purchase → Social Login

1. User purchases premium as guest
2. User clicks "Sign in with Google"
3. OAuth flow completes
4. **Purchase automatically linked** ✅
5. Premium features activated

### Scenario 3: Guest Data → Create Account

1. User saves favorites, shopping list as guest
2. User creates account
3. **All data automatically linked** ✅
4. User sees their favorites and lists

## Benefits

✅ **Lower Friction** - Users can purchase without creating account  
✅ **Better Conversion** - No signup barrier for purchases  
✅ **Seamless Linking** - Data automatically transfers when account created  
✅ **Social Login Ready** - Structure for OAuth providers  
✅ **Data Preservation** - Nothing is lost when creating account

## Next Steps

To complete OAuth integration:

1. Install OAuth packages:

   ```bash
   npx expo install expo-auth-session expo-crypto
   ```

2. Configure OAuth providers (Google, Apple, Facebook)

3. Update `convex/oauth.ts` with actual OAuth verification

4. Add OAuth buttons to login/signup screens

## Example: Purchase Flow

```typescript
// In your purchase screen
import { useGuestPurchase } from '@/hooks/useGuestPurchase';
import { useAuth } from '@/hooks/useAuth';

function PurchaseScreen() {
  const { isAuthenticated } = useAuth();
  const { processPurchase } = useGuestPurchase();

  const handlePurchase = async (type: 'monthly' | 'yearly') => {
    // Process payment (Stripe, Apple Pay, etc.)
    const transactionId = await processPayment(type);

    // Save purchase (works for both guests and authenticated users)
    await processPurchase(type, transactionId, getPrice(type));

    if (!isAuthenticated) {
      // Show prompt: "Create account to sync your purchase"
      router.push('/auth/signup?fromPurchase=true');
    }
  };
}
```

## Security Notes

- Guest purchases are stored locally until account creation
- Transaction IDs are verified when linking
- Duplicate purchases are prevented
- All data is encrypted in AsyncStorage
