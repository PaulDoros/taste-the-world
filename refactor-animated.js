const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const openTagPattern = /<Animated\.View([\s>])/g;
  const closeTagPattern = /<\/Animated\.View>/g;

  if (openTagPattern.test(content) || closeTagPattern.test(content)) {
    content = content.replace(openTagPattern, '<AnimatedView$1');
    content = content.replace(closeTagPattern, '</AnimatedView>');

    // Add import if not present
    if (content.indexOf('@/components/ui/AnimatedView') === -1) {
      content = content.replace(
        /^(import.*?;?\r?\n)/m,
        "$1import { AnimatedView } from '@/components/ui/AnimatedView';\n"
      );
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (
        file !== 'node_modules' &&
        file !== '.git' &&
        file !== '.expo' &&
        file !== 'assets' &&
        file !== 'convex'
      ) {
        traverse(fullPath);
      }
    } else if (
      fullPath.endsWith('.tsx') &&
      !fullPath.includes('AnimatedView.tsx')
    ) {
      processFile(fullPath);
    }
  }
}

traverse(path.join(process.cwd(), 'app'));
traverse(path.join(process.cwd(), 'components'));
