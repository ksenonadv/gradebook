const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Paths relative to project root
const ROOT_DIR = path.resolve(__dirname, '../..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

// Create docs directory if it doesn't exist
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Create docs/frontend directory if it doesn't exist
if (!fs.existsSync(path.join(DOCS_DIR, 'frontend'))) {
  fs.mkdirSync(path.join(DOCS_DIR, 'frontend'), { recursive: true });
}

// Create docs/backend directory if it doesn't exist
if (!fs.existsSync(path.join(DOCS_DIR, 'backend'))) {
  fs.mkdirSync(path.join(DOCS_DIR, 'backend'), { recursive: true });
}

// Create docs index.html
const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gradebook Documentation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #252732;
      color: #e4e6eb;
    }
    .container {
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background-color: #2c2e3b;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }
    h1 {
      color: #ffffff;
      text-align: center;
      margin-bottom: 30px;
    }
    .button-container {
      display: flex;
      justify-content: space-around;
      margin-top: 40px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #7c3aed;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #6d28d9;
    }
    p {
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Gradebook Documentation</h1>
    <p>
      Welcome to the Gradebook application documentation. Use the links below to access
      documentation for the frontend and backend components of the application.
    </p>
    
    <div class="button-container">
      <a href="./frontend/index.html" class="button">Frontend Documentation</a>
      <a href="./backend/index.html" class="button">Backend Documentation</a>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), indexHtml);

// Generate backend docs
console.log('Generating backend documentation...');
try {
  execSync('npx typedoc --options typedoc.json', { 
    cwd: BACKEND_DIR, 
    stdio: 'inherit' 
  });
  console.log('✅ Backend documentation generated!');
} catch (error) {
  console.error('❌ Error generating backend documentation:', error);
  process.exit(1);
}

// Generate frontend docs
console.log('Generating frontend documentation...');
try {
  execSync('npx typedoc --options typedoc.json', { 
    cwd: FRONTEND_DIR, 
    stdio: 'inherit' 
  });
  console.log('✅ Frontend documentation generated!');
} catch (error) {
  console.error('❌ Error generating frontend documentation:', error);
  process.exit(1);
}

console.log('Documentation successfully generated in the docs/ directory.');