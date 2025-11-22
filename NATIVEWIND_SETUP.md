# NativeWind v4 Setup Verification

## Current Configuration ✅

1. **Metro Config** (`metro.config.js`): ✅ Configured with `withNativeWind`
2. **Tailwind Config** (`tailwind.config.js`): ✅ Configured with NativeWind preset
3. **Global CSS** (`global.css`): ✅ Imported in `app/_layout.tsx`
4. **Package**: ✅ NativeWind v4.2.1 installed

## Important Notes

### Style Prop vs className
In React Native, when you use both `style` and `className`, the `style` prop takes precedence and can override className styles.

**Best Practice:**
- Use `className` for static styles (layout, spacing, colors that don't change)
- Use `style` prop only for dynamic values (colors from theme, calculated values)

### Components that don't support className
Some components don't support `className` directly:
- `LinearGradient` - Use `style` prop instead
- Some third-party components

### Restart Required
After changing NativeWind configuration, you MUST:
1. Stop the dev server (Ctrl+C)
2. Clear cache: `npx expo start -c` or `npm start -- --clear`
3. Restart the dev server

## Testing NativeWind

To verify NativeWind is working, try this simple test:

```tsx
<View className="bg-red-500 p-4 rounded-lg">
  <Text className="text-white text-xl font-bold">
    If you see red background, NativeWind is working!
  </Text>
</View>
```

If this doesn't show a red background, NativeWind is not processing classes correctly.

## Common Issues

1. **Styles not applying**: Restart dev server with `--clear` flag
2. **TypeScript errors**: Make sure `tailwind.config.js` content paths are correct
3. **Web not working**: NativeWind v4 should work on web, but some utilities might differ

