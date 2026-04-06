const fs = require('fs');
const path = require('path');

function checkFileCaseInsensitive(dir, filename) {
    const files = fs.readdirSync(dir);
    const exactMatch = files.includes(filename);
    if (!exactMatch) {
        const lowerMatch = files.find(f => f.toLowerCase() === filename.toLowerCase());
        if (lowerMatch) {
            return `Case mismatch: expects "${filename}" but found "${lowerMatch}"`;
        }
        return `File totally missing: ${filename}`;
    }
    return null;
}

function processDir(dir) {
    let errors = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist') {
                errors = errors.concat(processDir(fullPath));
            }
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Basic regex to find local imports
            const importRegex = /import\s+.*?from\s+['"](\.[^'"]+)['"]/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                const importPath = match[1];
                
                // resolve it
                const targetDir = path.dirname(path.resolve(dir, importPath));
                const targetBasename = path.basename(importPath);
                
                if (fs.existsSync(targetDir)) {
                    // It could be a file with .jsx or .js omitted
                    let toCheck = targetBasename;
                    let fileListing = fs.readdirSync(targetDir);
                    
                    let found = false;
                    for (let f of fileListing) {
                        if (f === targetBasename || f === targetBasename + '.js' || f === targetBasename + '.jsx' || f === targetBasename + '.css') {
                            found = true;
                            break;
                        }
                    }
                    
                    if (!found) {
                        // let's see if it's a case error
                        for (let f of fileListing) {
                            if (f.toLowerCase() === targetBasename.toLowerCase() || f.toLowerCase() === targetBasename.toLowerCase() + '.js' || f.toLowerCase() === targetBasename.toLowerCase() + '.jsx') {
                                errors.push(`ERROR in ${fullPath}\nImported: "${importPath}"\nActually exists as: "${f}"\n`);
                            }
                        }
                    }
                }
            }
        }
    }
    return errors;
}

const errs = processDir(path.join(__dirname, 'src'));
if (errs.length) {
    console.log(errs.join('\n'));
} else {
    console.log("No case mismatches found in imports!");
}
