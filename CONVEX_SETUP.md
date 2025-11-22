# 🚀 Convex Backend Setup Guide

This guide will help you set up Convex for the Taste the World app.

## 📋 Prerequisites

1. A Convex account (sign up at [convex.dev](https://convex.dev))
2. Node.js installed
3. The Convex CLI installed globally (optional, or use npx)

## 🔧 Setup Steps

### 1. Install Convex (Already Done ✅)

Convex is already installed in the project. If you need to reinstall:

```bash
npm install convex
```

### 2. Initialize Convex Project

Run the following command to initialize Convex:

```bash
npx convex dev
```

This will:
- Prompt you to login or create an account
- Create a `.convex` folder with your deployment configuration
- Start the Convex development server
- Generate TypeScript types automatically

### 3. Configure Environment Variables

After running `npx convex dev`, you'll get a deployment URL. Add it to your environment:

**Option 1: Create `.env` file** (recommended for development)

```bash
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**Option 2: Update `lib/convex.ts` directly**

Replace the placeholder URL in `lib/convex.ts` with your actual deployment URL.

### 4. Deploy Schema and Functions

Once `npx convex dev` is running, it will automatically:
- Deploy your schema (`convex/schema.ts`)
- Deploy all your functions (queries and mutations)
- Generate TypeScript types in `convex/_generated/`

## 📁 Project Structure

```
convex/
├── schema.ts              # Database schema definition
├── auth.ts                # User authentication functions
├── pantry.ts              # Pantry item functions
├── shoppingList.ts        # Shopping list functions
├── favorites.ts           # Favorites functions
├── recipeHistory.ts      # Recipe history functions
└── _generated/           # Auto-generated types (don't edit)
    ├── api.d.ts
    ├── dataModel.d.ts
    └── server.d.ts
```

## 🗄️ Database Schema

The following tables are defined:

- **users** - User accounts and subscription info
- **pantry** - User's pantry items with quantities
- **shoppingList** - Shopping list items
- **favorites** - User's favorite recipes
- **recipeHistory** - Recipe viewing history

## 🔌 Using Convex in Your App

### Queries (Read Data)

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
  const pantryItems = useQuery(api.pantry.getPantryItems, {
    userId: "user-id-here"
  });
  
  // pantryItems will be undefined while loading, then the data
  if (pantryItems === undefined) {
    return <Text>Loading...</Text>;
  }
  
  return <Text>Items: {pantryItems.length}</Text>;
}
```

### Mutations (Write Data)

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
  const addItem = useMutation(api.pantry.addPantryItem);
  
  const handleAdd = async () => {
    await addItem({
      userId: "user-id-here",
      name: "flour",
      displayName: "Flour",
      measure: "500g"
    });
  };
  
  return <Button onPress={handleAdd}>Add Item</Button>;
}
```

## 🎯 Next Steps

1. **Run Convex Dev Server:**
   ```bash
   npx convex dev
   ```

2. **Get Your Deployment URL:**
   - Copy the URL from the terminal output
   - Add it to `.env` or `lib/convex.ts`

3. **Update Stores:**
   - The Zustand stores need to be updated to sync with Convex
   - See `CONVEX_INTEGRATION.md` for details (coming soon)

4. **Test the Connection:**
   - Start your Expo app: `npm start`
   - The ConvexProvider in `app/_layout.tsx` will connect automatically

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex React Quickstart](https://docs.convex.dev/quickstart/react)
- [Convex Schema Guide](https://docs.convex.dev/database/schemas)

## ⚠️ Important Notes

- Never commit `.convex/` folder to git (already in `.gitignore`)
- Never commit `.env` file with your deployment URL (already in `.gitignore`)
- The `_generated/` folder is auto-generated - don't edit it manually
- Always run `npx convex dev` before starting your app in development

## 🐛 Troubleshooting

### "Cannot find module 'convex/react'"

Make sure Convex is installed:
```bash
npm install convex
```

### "Invalid deployment URL"

1. Run `npx convex dev` to get your deployment URL
2. Update `lib/convex.ts` or `.env` with the correct URL
3. Restart your Expo app

### "Schema validation failed"

Check your `convex/schema.ts` file for syntax errors. The Convex dev server will show detailed error messages.

---

**Ready to go!** 🎉 Run `npx convex dev` to start your backend.

