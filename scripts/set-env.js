const fs = require('fs');
const path = require('path');

// Read from environment variables or use defaults
const apiUrl = process.env['NG_APP_API_URL'] || 'http://localhost:3000/api/currency';

const envConfigFile = `export const environment = {
  apiUrl: '${apiUrl}'
};
`;

const targetPath = path.join(__dirname, '../src/environments/environment.ts');
fs.writeFileSync(targetPath, envConfigFile);

console.log(`Environment file generated at ${targetPath}`);
console.log(`API URL: ${apiUrl}`);
