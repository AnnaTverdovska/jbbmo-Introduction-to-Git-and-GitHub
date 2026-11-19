# Interest Calculators

[![CI](https://github.com/AnnaTverdovska/jbbmo-Introduction-to-Git-and-GitHub/actions/workflows/ci.yml/badge.svg)](https://github.com/AnnaTverdovska/jbbmo-Introduction-to-Git-and-GitHub/actions/workflows/ci.yml)

Two small command-line calculators, one in Bash and one in Python. The repository
started as the lab project of the IBM *Introduction to Git and GitHub* course; the
original scripts are by Upkar Lidder (IBM).

| Script | Calculates | Formula |
|---|---|---|
| `simple-interest.sh` | simple interest | `p × r × t / 100` |
| `compound_interest.py` | compound interest, compounded yearly | `p × (1 + r/100)^t − p` |

`p` is the principal, `r` the annual interest rate in percent and `t` the time in years.

## Usage

Both scripts ask for the values when started without arguments, or take them on the
command line:

```bash
./simple-interest.sh 1000 5 2             # principal, rate %, years
# The simple interest is: 100.00

python compound_interest.py 1000 2 5      # principal, years, rate %
# The compound interest is 102.50
# The final amount is 1102.50
```

Decimal values are supported; negative numbers and text are rejected. Note the
argument order: the Python script keeps the original `p, t, r` order.

## Running the tests

```bash
bash tests/test-simple-interest.sh
pip install pytest && pytest
```

The tests and [ShellCheck](https://www.shellcheck.net/) run on every push and pull
request through GitHub Actions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[Apache License 2.0](LICENSE). Original lab material © IBM Developer Skills Network.
