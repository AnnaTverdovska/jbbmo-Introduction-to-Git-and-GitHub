"""Compound interest calculator.

Calculates yearly compound interest from a principal, an annual interest
rate (in %) and a time period in years:

    final amount      = p * (1 + r/100) ** t
    compound interest = final amount - p

Sample purpose only - do not use in production.

Author: Upkar Lidder (IBM)
Additional authors: AnnaTverdovska
Changes (2026, AnnaTverdovska): report the interest instead of the final
amount, input validation, command-line arguments. Original version: IBM
Developer Skills Network.

Usage:
    python compound_interest.py                # interactive, asks for each value
    python compound_interest.py <p> <t> <r>    # non-interactive

Example:
    python compound_interest.py 1000 2 5       # -> interest 102.50, final amount 1102.50
"""
import sys


def _check(name, value):
    if value < 0:
        raise ValueError(f"{name} must not be negative, got {value}")


def compound_amount(p, t, r):
    """Final amount after t years at r % per year, compounded yearly."""
    for name, value in (("principal", p), ("time period", t), ("rate", r)):
        _check(name, value)
    return p * (1 + r / 100) ** t


def compound_interest(p, t, r):
    """Interest earned: the final amount minus the principal."""
    return compound_amount(p, t, r) - p


def _ask(prompt):
    while True:
        try:
            value = float(input(prompt))
            _check("value", value)
            return value
        except ValueError:
            print("Please enter a non-negative number.")


def main(argv):
    if len(argv) == 0:
        p = _ask("Enter the principal amount: ")
        t = _ask("Enter the time period in years: ")
        r = _ask("Enter the rate of interest per year (%): ")
    elif len(argv) == 3:
        try:
            p, t, r = (float(v) for v in argv)
            compound_amount(p, t, r)
        except ValueError as error:
            print(f"Error: {error}", file=sys.stderr)
            return 1
    else:
        print(f"Usage: {sys.argv[0]} [principal years rate_percent]", file=sys.stderr)
        return 1

    print(f"The compound interest is {compound_interest(p, t, r):.2f}")
    print(f"The final amount is {compound_amount(p, t, r):.2f}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
