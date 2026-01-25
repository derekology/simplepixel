const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

html = html.replace(/src="\/assets\//g, 'src="/frontend/assets/');
html = html.replace(/href="\/assets\//g, 'href="/frontend/assets/');

fs.writeFileSync(indexPath, html);
console.log('✓ Post-build: Updated index.html with EJS templates and asset paths');
