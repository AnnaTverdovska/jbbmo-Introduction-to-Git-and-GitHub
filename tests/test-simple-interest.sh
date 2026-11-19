#!/usr/bin/env bash
# Tests for simple-interest.sh. Run from the repository root:
#   bash tests/test-simple-interest.sh
set -uo pipefail

script="$(dirname "$0")/../simple-interest.sh"
failures=0

check() {
  local name=$1 expected=$2 actual=$3
  if [[ $actual == *"$expected"* ]]; then
    echo "ok   - $name"
  else
    echo "FAIL - $name: expected '$expected', got '$actual'"
    failures=$((failures + 1))
  fi
}

check "integer arguments"      "The simple interest is: 100.00" "$(bash "$script" 1000 5 2 2>&1)"
check "decimal arguments"      "The simple interest is: 105.00" "$(bash "$script" 1500 3.5 2 2>&1)"
check "zero rate"              "The simple interest is: 0.00"   "$(bash "$script" 1000 0 5 2>&1)"
check "interactive input"      "The simple interest is: 37.50"  "$(printf '500\n2.5\n3\n' | bash "$script" 2>&1)"
check "interactive retry"      "The simple interest is: 100.00" "$(printf 'abc\n1000\n5\n2\n' | bash "$script" 2>&1)"
check "rejects text argument"  "is not a valid"                  "$(bash "$script" 1000 five 2 2>&1)"
check "rejects negative value" "is not a valid"                  "$(bash "$script" -1000 5 2 2>&1)"
check "wrong argument count"   "Usage:"                          "$(bash "$script" 1000 5 2>&1)"

bash "$script" 1000 five 2 >/dev/null 2>&1
check "non-zero exit on bad input" "1" "$?"

if [[ $failures -gt 0 ]]; then
  echo "$failures test(s) failed"
  exit 1
fi
echo "All tests passed"
