#!/usr/bin/env bash
# Simple interest calculator.
#
# Calculates simple interest from a principal, an annual interest rate (in %)
# and a time period in years:
#
#     simple interest = p * r * t / 100
#
# Sample purpose only - do not use in production.
#
# Author: Upkar Lidder (IBM)
# Additional authors: AnnaTverdovska
# Changes (2026, AnnaTverdovska): decimal support, input validation,
# command-line arguments. Original version: IBM Developer Skills Network.
#
# Usage:
#   ./simple-interest.sh                  # interactive, asks for each value
#   ./simple-interest.sh <p> <r> <t>      # non-interactive
#
# Example:
#   ./simple-interest.sh 1000 5 2         # -> 100.00

set -euo pipefail

usage() {
  echo "Usage: $0 [principal rate_percent years]" >&2
  echo "All values must be non-negative numbers, e.g. $0 1500 3.5 2" >&2
}

# Accepts non-negative integers and decimals such as 10, 2.5 or .75
is_number() {
  [[ $1 =~ ^([0-9]+([.][0-9]*)?|[.][0-9]+)$ ]]
}

ask() {
  local prompt=$1 value
  while true; do
    read -r -p "$prompt " value || { echo >&2; exit 1; }
    if is_number "$value"; then
      printf '%s' "$value"
      return
    fi
    echo "'$value' is not a valid non-negative number, please try again." >&2
  done
}

if [[ $# -eq 0 ]]; then
  p=$(ask "Enter the principal:")
  r=$(ask "Enter rate of interest per year (%):")
  t=$(ask "Enter time period in years:")
elif [[ $# -eq 3 ]]; then
  p=$1 r=$2 t=$3
  for v in "$p" "$r" "$t"; do
    if ! is_number "$v"; then
      echo "Error: '$v' is not a valid non-negative number." >&2
      usage
      exit 1
    fi
  done
else
  usage
  exit 1
fi

s=$(awk -v p="$p" -v r="$r" -v t="$t" 'BEGIN { printf "%.2f", p * r * t / 100 }')

echo "The simple interest is: $s"
