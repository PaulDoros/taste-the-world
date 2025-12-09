const fs = require('fs');
const path = require('path');

const plannerPath = path.join(__dirname, '../app/(tabs)/planner.tsx');
let content = fs.readFileSync(plannerPath, 'utf8');

// 1. Remove the prop 'modeAnim={modeAnim}' from the AnimatedModeSwitcher call
// Regex to handle multiline props if needed
const propRegex = /(\s+modeAnim=\{modeAnim\})/g;
content = content.replace(propRegex, '');

// 2. Remove 'const modeAnim = useSharedValue(0);'
// Regex matches the line with optional whitespace
const initRegex = /(\s*const\s+modeAnim\s*=\s*useSharedValue\(0\);\s*)/g;
content = content.replace(initRegex, '');

// 3. Remove the useEffect that updates modeAnim
// This is trickier as it's a block.
// We look for: useEffect(() => { ... modeAnim.value = ... }, [mode]);
// Let's match typical formatting
const effectRegex =
  /useEffect\(\(\)\s*=>\s*\{\s*modeAnim\.value\s*=\s*withSpring[\s\S]*?\}\,\s*\[mode\]\);\s*/;
content = content.replace(effectRegex, '');

fs.writeFileSync(plannerPath, content);
console.log('Successfully cleaned up modeAnim usage!');
