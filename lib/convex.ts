import { ConvexReactClient } from 'convex/react';

/**
 * Convex React Client
 * This will be configured with your Convex deployment URL
 *
 * To get your deployment URL:
 * 1. Run `npx convex dev` to start Convex
 * 2. Copy the deployment URL from the output
 * 3. Set it as an environment variable or update this file
 */

// Get Convex deployment URL from environment variable
// This is set in .env file: EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.warn(
    '⚠️  Missing EXPO_PUBLIC_CONVEX_URL environment variable.\n' +
      '   Please add it to your .env file.\n' +
      "   Run 'npx convex dev' to get your deployment URL.\n" +
      '   The app will use a placeholder URL for now.'
  );
}

// Use placeholder if URL not set (app will show connection error until URL is added)
export const convex = new ConvexReactClient(
  CONVEX_URL || 'https://placeholder.convex.cloud'
);
