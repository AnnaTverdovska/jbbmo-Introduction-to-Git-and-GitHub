# Contributing

All contributions, bug reports, bug fixes, documentation improvements,
enhancements, and ideas are welcome.

1. Open an issue using the bug report or feature request template, or pick an
   existing one.
2. Create a branch for your change.
3. Run the tests before opening a pull request, and add a test for any behaviour
   you change:
   ```bash
   shellcheck simple-interest.sh tests/*.sh
   bash tests/test-simple-interest.sh
   pytest
   ```
4. Open a pull request describing what you changed and why.

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
