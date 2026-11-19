// Interest formulas, shared by the web page and the tests.
// Same maths as simple-interest.sh and compound_interest.py:
//   simple interest   = p * r * t / 100
//   compound interest = p * (1 + r/100) ** t - p   (compounded yearly)

function check(values) {
  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new RangeError(`${name} must be a number of 0 or more`);
    }
  }
}

export function simpleInterest({ principal, rate, years }) {
  check({ principal, rate, years });
  return (principal * rate * years) / 100;
}

export function compoundAmount({ principal, rate, years }) {
  check({ principal, rate, years });
  return principal * (1 + rate / 100) ** years;
}

export function compoundInterest({ principal, rate, years }) {
  return compoundAmount({ principal, rate, years }) - principal;
}

// Balance at the end of each year 0..years, for both kinds of interest.
export function yearlyBalances({ principal, rate, years }) {
  check({ principal, rate, years });
  const rows = [];
  for (let year = 0; year <= Math.floor(years); year += 1) {
    const simple = principal + simpleInterest({ principal, rate, years: year });
    const compound = compoundAmount({ principal, rate, years: year });
    rows.push({ year, simple, compound, difference: compound - simple });
  }
  return rows;
}
