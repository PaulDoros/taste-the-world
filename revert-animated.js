const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Revert JSX tags
  const openTagPattern = /<AnimatedView([\s>])/g;
  const closeTagPattern = /<\/AnimatedView>/g;

  if (openTagPattern.test(content) || closeTagPattern.test(content)) {
    content = content.replace(openTagPattern, '<Animated.View$1');
    content = content.replace(closeTagPattern, '</Animated.View>');

    // Remove the import statement
    content = content.replace(
      /import\s+{\s*AnimatedView\s*}\s+from\s+['"]@\/components\/ui\/AnimatedView['"];?\r?\n/g,
      ''
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Reverted: ' + filePath);
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
