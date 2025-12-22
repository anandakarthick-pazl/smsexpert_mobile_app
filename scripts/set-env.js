/**
 * Pre-build script to set the correct environment
 * This script copies the appropriate .env file before building
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.join(__dirname, '..');

const envFiles = {
  '1': { name: 'Local', file: '.env.local' },
  '2': { name: 'Development', file: '.env.development' },
  '3': { name: 'Production', file: '.env.production' },
};

// Check if ENVFILE is set via environment variable
const envFile = process.env.ENVFILE;

if (envFile) {
  // Environment file specified via command line
  const sourcePath = path.join(rootDir, envFile);
  const destPath = path.join(rootDir, '.env');
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`\n✅ Environment set to: ${envFile}\n`);
    
    // Read and display the API URL
    const envContent = fs.readFileSync(destPath, 'utf8');
    const apiUrlMatch = envContent.match(/API_BASE_URL=(.+)/);
    if (apiUrlMatch) {
      console.log(`🔗 API URL: ${apiUrlMatch[1]}\n`);
    }
    process.exit(0);
  } else {
    console.error(`\n❌ Error: ${envFile} not found!\n`);
    process.exit(1);
  }
}

// Interactive mode - ask user to select environment
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n========================================');
console.log('   SMS Expert - Select Environment');
console.log('========================================\n');
console.log('  1. Local');
console.log('  2. Development');
console.log('  3. Production');
console.log('');

rl.question('Enter choice (1-3): ', (answer) => {
  const selected = envFiles[answer];
  
  if (!selected) {
    console.error('\n❌ Invalid choice!\n');
    rl.close();
    process.exit(1);
  }
  
  const sourcePath = path.join(rootDir, selected.file);
  const destPath = path.join(rootDir, '.env');
  
  if (!fs.existsSync(sourcePath)) {
    console.error(`\n❌ Error: ${selected.file} not found!\n`);
    rl.close();
    process.exit(1);
  }
  
  // Copy the selected env file to .env
  fs.copyFileSync(sourcePath, destPath);
  
  console.log(`\n✅ Environment set to: ${selected.name}`);
  
  // Read and display the API URL
  const envContent = fs.readFileSync(destPath, 'utf8');
  const apiUrlMatch = envContent.match(/API_BASE_URL=(.+)/);
  if (apiUrlMatch) {
    console.log(`🔗 API URL: ${apiUrlMatch[1]}`);
  }
  
  console.log('\n');
  
  rl.close();
  process.exit(0);
});
