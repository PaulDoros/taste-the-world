---
description: Create a new reusable component with checks for existing solutions
---

1. **Search Existing Components**
   - Use `find_by_name` or `grep_search` to look for similar components in `src/components` or `components/`.
   - specificially check `components/ui` or `tamagui` config if applicable.
   - If a similar component exists, ask the user if they want to extend it instead of creating a new one.

2. **Plan Component Structure**
   - **Single Responsibility**: Ensure the component does one thing well.
   - **Props Interface**: Define clear TypeScript interfaces for props.
   - **Styling**: Use the project's styling system (Tamagui/Tailwind/StyleSheet).

3. **Create Component File**
   - Create file in `components/[Category]/[ComponentName].tsx` or `components/[ComponentName].tsx`.
   - **Boilerplate**:

   ```tsx
   import React from 'react';
   import { YStack, Text } from 'tamagui'; // or relevant imports

   interface [ComponentName]Props {
     // Defined props
   }

   export const [ComponentName] = ({ ...props }: [ComponentName]Props) => {
     return (
       <YStack>
         <Text>[ComponentName]</Text>
       </YStack>
     );
   };
   ```

4. **Verify Reusability**
   - Ensure no hardcoded strings (use props or i18n).
   - Ensure generic styling hooks.

5. **Export**
   - Add to `components/index.ts` if it exists.
