#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing PWA Configuration...\n');

// Test 1: Check if manifest.json exists and is valid
console.log('1. Checking manifest.json...');
try {
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log('   ✅ manifest.json exists and is valid JSON');
    console.log(`   📱 App name: ${manifest.name}`);
    console.log(`   🎨 Theme color: ${manifest.theme_color}`);
    console.log(`   📐 Icons: ${manifest.icons.length} defined`);
  } else {
    console.log('   ❌ manifest.json not found');
  }
} catch (error) {
  console.log('   ❌ manifest.json is invalid:', error.message);
}

// Test 2: Check if service worker exists
console.log('\n2. Checking service worker...');
const swPath = path.join(__dirname, '../public/sw.js');
if (fs.existsSync(swPath)) {
  console.log('   ✅ sw.js exists');
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (swContent.includes('install')) {
    console.log('   ✅ Service worker has install event');
  }
  if (swContent.includes('fetch')) {
    console.log('   ✅ Service worker has fetch event');
  }
  if (swContent.includes('activate')) {
    console.log('   ✅ Service worker has activate event');
  }
} else {
  console.log('   ❌ sw.js not found');
}

// Test 3: Check if icons exist
console.log('\n3. Checking PWA icons...');
const iconsDir = path.join(__dirname, '../public/icons');
if (fs.existsSync(iconsDir)) {
  const iconFiles = fs.readdirSync(iconsDir);
  const requiredSizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];
  
  console.log(`   📁 Icons directory exists with ${iconFiles.length} files`);
  
  requiredSizes.forEach(size => {
    const iconFile = `icon-${size}.png`;
    if (iconFiles.includes(iconFile)) {
      console.log(`   ✅ ${iconFile} exists`);
    } else {
      console.log(`   ⚠️  ${iconFile} missing`);
    }
  });
} else {
  console.log('   ❌ Icons directory not found');
}

// Test 4: Check if offline page exists
console.log('\n4. Checking offline page...');
const offlinePath = path.join(__dirname, '../public/offline.html');
if (fs.existsSync(offlinePath)) {
  console.log('   ✅ offline.html exists');
} else {
  console.log('   ⚠️  offline.html not found (optional but recommended)');
}

// Test 5: Check Next.js configuration
console.log('\n5. Checking Next.js configuration...');
const nextConfigPath = path.join(__dirname, '../next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  if (nextConfig.includes('headers')) {
    console.log('   ✅ Next.js headers configured for PWA');
  }
  if (nextConfig.includes('sw.js')) {
    console.log('   ✅ Service worker headers configured');
  }
  console.log('   ✅ next.config.ts exists with PWA configuration');
} else {
  console.log('   ❌ next.config.ts not found');
}

// Test 6: Check PWA components
console.log('\n6. Checking PWA components...');
const componentsToCheck = [
  '../src/components/PWAInstaller.tsx',
  '../src/components/OfflineIndicator.tsx',
  '../src/hooks/usePWA.ts'
];

componentsToCheck.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  const componentName = path.basename(componentPath);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${componentName} exists`);
  } else {
    console.log(`   ❌ ${componentName} not found`);
  }
});

// Test 7: Check package.json for PWA dependencies
console.log('\n7. Checking dependencies...');
try {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const pwaRelatedDeps = [
    'next-pwa',
    'workbox-webpack-plugin'
  ];
  
  pwaRelatedDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`   ✅ ${dep} is installed`);
    } else {
      console.log(`   ⚠️  ${dep} not found (may not be required)`);
    }
  });
} catch (error) {
  console.log('   ❌ Could not read package.json');
}

console.log('\n🎉 PWA Configuration Test Complete!');
console.log('\n📋 Next Steps:');
console.log('   1. Run "npm run build" to build the app');
console.log('   2. Run "npm run start" to test in production mode');
console.log('   3. Open Chrome DevTools > Application > Manifest to verify');
console.log('   4. Test offline functionality by going offline in DevTools');
console.log('   5. Test installation prompt on supported browsers');
console.log('\n💡 Tips:');
console.log('   - PWA features work best in production mode');
console.log('   - Use HTTPS for full PWA functionality');
console.log('   - Test on mobile devices for best experience'); 