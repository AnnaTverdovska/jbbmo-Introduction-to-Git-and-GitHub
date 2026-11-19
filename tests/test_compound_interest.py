import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from compound_interest import compound_amount, compound_interest  # noqa: E402

SCRIPT = Path(__file__).resolve().parents[1] / "compound_interest.py"


def run(*args, stdin=""):
    return subprocess.run([sys.executable, str(SCRIPT), *args], input=stdin,
                          capture_output=True, text=True)


def test_interest_is_amount_minus_principal():
    # 1000 at 5 % for 2 years: 1000 * 1.05**2 = 1102.50, so the interest is 102.50
    assert compound_amount(1000, 2, 5) == pytest.approx(1102.50)
    assert compound_interest(1000, 2, 5) == pytest.approx(102.50)


def test_decimal_values():
    assert compound_interest(1500, 3, 2.5) == pytest.approx(1500 * 1.025 ** 3 - 1500)


def test_zero_rate_or_time_earns_nothing():
    assert compound_interest(1000, 5, 0) == 0
    assert compound_interest(1000, 0, 5) == 0


def test_negative_values_are_rejected():
    with pytest.raises(ValueError):
        compound_interest(-1000, 2, 5)


def test_command_line_arguments():
    result = run("1000", "2", "5")
    assert result.returncode == 0
    assert "The compound interest is 102.50" in result.stdout
    assert "The final amount is 1102.50" in result.stdout


def test_interactive_input_with_retry():
    result = run(stdin="abc\n1000\n2\n5\n")
    assert "Please enter a non-negative number." in result.stdout
    assert "The compound interest is 102.50" in result.stdout


def test_invalid_arguments():
    assert run("1000", "two", "5").returncode == 1
    assert run("1000", "2").returncode == 1
