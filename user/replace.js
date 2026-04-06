import fs from 'fs';
import path from 'path';

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Special handling for already interpolated paths
      if (content.includes('API_BASE = "http://localhost:5050"')) {
        content = content.replace('API_BASE = "http://localhost:5050"', 'API_BASE = import.meta.env.VITE_API_URL');
        modified = true;
      }

      // Handle backtick urls: `http://localhost:5050/api/${id}` 
      const backtickRegex = /`http:\/\/localhost:5050([^`]*?)`/g;
      if (backtickRegex.test(content)) {
        content = content.replace(backtickRegex, '`${import.meta.env.VITE_API_URL}$1`');
        modified = true;
      }

      // Handle double quote string: "http://localhost:5050/api/login"
      const doubleQuoteRegex = /"http:\/\/localhost:5050([^"]*?)"/g;
      if (doubleQuoteRegex.test(content)) {
        content = content.replace(doubleQuoteRegex, '`${import.meta.env.VITE_API_URL}$1`');
        modified = true;
      }

      // Handle single quote string: 'http://localhost:5050/api/login'
      const singleQuoteRegex = /'http:\/\/localhost:5050([^']*?)'/g;
      if (singleQuoteRegex.test(content)) {
        content = content.replace(singleQuoteRegex, '`${import.meta.env.VITE_API_URL}$1`');
        modified = true;
      }

      if (modified) {
        console.log(`Modified: ${fullPath}`);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

// Start from the user/src directory
processDir(path.join(process.cwd(), 'src'));
