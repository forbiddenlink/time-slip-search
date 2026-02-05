#!/bin/bash
# Comprehensive functionality verification script

echo "🔍 TimeSlipSearch - Functionality Verification"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

passed=0
failed=0

test_api() {
    local test_name="$1"
    local query="$2"
    local expected_check="$3"
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    response=$(curl -s -X POST http://localhost:3000/api/chat \
        -H "Content-Type: application/json" \
        -d "{\"message\":\"$query\"}")
    
    if echo "$response" | jq -e "$expected_check" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((passed++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Response: $response" | jq '.' 2>/dev/null || echo "$response"
        ((failed++))
    fi
    echo ""
}

echo -e "${CYAN}=== Core Search Functionality ===${NC}"
test_api "Plain year query (1985)" "1985" '.structured.year == 1985'
test_api "Natural language (Summer of 69)" "Summer of 69" '.structured.year == 1969'
test_api "Month and year (December 1985)" "December 1985" '.structured.year == 1985 and (.structured.dateDisplay | contains("December"))'

echo -e "${CYAN}=== Date Range Queries (NEW) ===${NC}"
test_api "Date range (from 1980 to 1985)" "from 1980 to 1985" '(.structured.dateDisplay | contains("to"))'
test_api "Date range (between 1970 and 1975)" "between 1970 and 1975" '(.structured.dateDisplay | contains("to"))'

echo -e "${CYAN}=== Results & Data ===${NC}"
test_api "Returns songs" "1990" '.structured.results.songs | length > 0'
test_api "Returns suggestions" "1995" '.structured.suggestions | length > 0'
test_api "Returns insights" "1975" '.structured.insights | length > 0'

echo -e "${CYAN}=== Error Handling ===${NC}"
echo -e "${YELLOW}Testing: Invalid query handling${NC}"
response=$(curl -s -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"asdfghjkl"}')
if echo "$response" | jq -e '.response | contains("couldn")' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSED - Returns helpful error message${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((failed++))
fi
echo ""

echo -e "${CYAN}=== Build & Deployment ===${NC}"
echo -e "${YELLOW}Testing: Production build${NC}"
if [ -d ".next" ]; then
    echo -e "${GREEN}✓ PASSED - Build artifacts exist${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAILED - No build artifacts${NC}"
    ((failed++))
fi
echo ""

echo -e "${CYAN}=== TypeScript Strict Mode ===${NC}"
echo -e "${YELLOW}Testing: No compilation errors${NC}"
if npm run build 2>&1 | grep -q "Compiled successfully"; then
    echo -e "${GREEN}✓ PASSED - TypeScript compilation clean${NC}"
    ((passed++))
else
    echo -e "${RED}✗ FAILED - TypeScript errors exist${NC}"
    ((failed++))
fi
echo ""

# Summary
echo "=============================================="
echo -e "${CYAN}Test Results Summary${NC}"
echo "=============================================="
echo -e "Passed: ${GREEN}$passed${NC}"
echo -e "Failed: ${RED}$failed${NC}"
total=$((passed + failed))
percentage=$((passed * 100 / total))
echo -e "Success Rate: ${percentage}%"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! App is fully functional.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review output above.${NC}"
    exit 1
fi
