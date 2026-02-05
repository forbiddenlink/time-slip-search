#!/usr/bin/env node
/**
 * Quick functionality test script
 * Tests core features without requiring Jest
 */

const http = require('http');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ message: query });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(body)
          });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  log('\n🧪 TimeSlipSearch Functionality Tests\n', 'cyan');
  
  let passed = 0;
  let failed = 0;

  // Test 1: API responds
  try {
    log('Test 1: API endpoint responds...', 'yellow');
    const response = await testAPI('Summer of 69');
    if (response.status === 200) {
      log('✓ API responds with 200', 'green');
      passed++;
    } else {
      log(`✗ API returned status ${response.status}`, 'red');
      failed++;
    }
  } catch (error) {
    log(`✗ API test failed: ${error.message}`, 'red');
    failed++;
  }

  // Test 2: Date parsing works
  try {
    log('Test 2: Date parsing and search...', 'yellow');
    const response = await testAPI('December 1985');
    if (response.data.structured && response.data.structured.year === 1985) {
      log('✓ Date parsing works correctly', 'green');
      passed++;
    } else {
      log('✗ Date parsing failed', 'red');
      failed++;
    }
  } catch (error) {
    log(`✗ Date parsing test failed: ${error.message}`, 'red');
    failed++;
  }

  // Test 3: Results returned
  try {
    log('Test 3: Search returns results...', 'yellow');
    const response = await testAPI('1969');
    const results = response.data.structured?.results;
    if (results && (results.songs.length > 0 || results.movies.length > 0)) {
      log(`✓ Search returned ${results.songs.length} songs, ${results.movies.length} movies`, 'green');
      passed++;
    } else {
      log('✗ No results returned', 'red');
      failed++;
    }
  } catch (error) {
    log(`✗ Results test failed: ${error.message}`, 'red');
    failed++;
  }

  // Test 4: Rate limiting headers
  try {
    log('Test 4: Rate limiting...', 'yellow');
    const response = await testAPI('1980');
    if (response.headers['x-ratelimit-limit']) {
      log('✓ Rate limiting headers present', 'green');
      passed++;
    } else {
      log('✗ Rate limiting headers missing', 'red');
      failed++;
    }
  } catch (error) {
    log(`✗ Rate limiting test failed: ${error.message}`, 'red');
    failed++;
  }

  // Test 5: Suggestions generated
  try {
    log('Test 5: AI suggestions...', 'yellow');
    const response = await testAPI('1975');
    if (response.data.structured?.suggestions && response.data.structured.suggestions.length > 0) {
      log(`✓ Generated ${response.data.structured.suggestions.length} suggestions`, 'green');
      passed++;
    } else {
      log('✗ No suggestions generated', 'red');
      failed++;
    }
  } catch (error) {
    log(`✗ Suggestions test failed: ${error.message}`, 'red');
    failed++;
  }

  // Test 6: Insights generated
  try {
    log('Test 6: AI insights...', 'yellow');
    const response = await testAPI('Summer of 1969');
    if (response.data.structured?.insights && response.data.structured.insights.length > 0) {
      log(`✓ Generated ${response.data.structured.insights.length} insights`, 'green');
      passed++;
    } else {
      log('✗ No insights generated', 'red');
      failed++;
    }
  } catch (error) {
    log(`✗ Insights test failed: ${error.message}`, 'red');
    failed++;
  }

  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log(`\nTest Results: ${passed} passed, ${failed} failed`, passed === 6 ? 'green' : 'yellow');
  log(`Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`, passed === 6 ? 'green' : 'yellow');

  process.exit(failed > 0 ? 1 : 0);
}

// Wait a bit for server to be ready, then run tests
setTimeout(() => {
  runTests().catch((error) => {
    log(`\n✗ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}, 2000);
