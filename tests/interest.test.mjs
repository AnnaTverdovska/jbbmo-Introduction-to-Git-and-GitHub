// Run with: node --test tests/
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  compoundAmount,
  compoundInterest,
  simpleInterest,
  yearlyBalances,
} from "../docs/interest.js";

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
const example = { principal: 1000, rate: 5, years: 2 };

test("matches the command-line scripts", () => {
  close(simpleInterest(example), 100); // simple-interest.sh 1000 5 2
  close(compoundAmount(example), 1102.5); // compound_interest.py 1000 2 5
  close(compoundInterest(example), 102.5);
});

test("no interest at 0 % or after 0 years", () => {
  close(compoundInterest({ principal: 1000, rate: 0, years: 5 }), 0);
  close(compoundInterest({ principal: 1000, rate: 5, years: 0 }), 0);
  close(simpleInterest({ principal: 1000, rate: 0, years: 5 }), 0);
});

test("rejects negative and non-numeric input", () => {
  assert.throws(() => simpleInterest({ principal: -1, rate: 5, years: 2 }), RangeError);
  assert.throws(() => compoundAmount({ principal: 1000, rate: Number.NaN, years: 2 }), RangeError);
});

test("year-by-year balances start at the principal and diverge", () => {
  const rows = yearlyBalances({ principal: 1000, rate: 5, years: 10 });
  assert.equal(rows.length, 11);
  assert.deepEqual(rows[0], { year: 0, simple: 1000, compound: 1000, difference: 0 });
  close(rows[1].difference, 0); // after one year both are the same
  close(rows[2].difference, 2.5); // 1102.50 vs 1100.00
  close(rows[10].compound, 1000 * 1.05 ** 10);
  assert.ok(rows.every((row, i) => i === 0 || row.difference >= rows[i - 1].difference));
});
