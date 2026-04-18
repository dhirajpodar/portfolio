"""Unit tests for pageindex_utils helpers. Run: python -m unittest backend/scripts/test_pageindex_utils.py"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pageindex_utils import _strip_reasoning


class StripReasoningTests(unittest.TestCase):
    def test_single_line_think_block_removed(self):
        self.assertEqual(
            _strip_reasoning("<think>let me decide</think>Final answer."),
            "Final answer.",
        )

    def test_multiline_think_block_removed(self):
        raw = "<think>\nstep 1\nstep 2\n</think>\n\nThe answer is 42."
        self.assertEqual(_strip_reasoning(raw), "The answer is 42.")

    def test_passthrough_when_no_think_tag(self):
        plain = "This response has no reasoning markers."
        self.assertEqual(_strip_reasoning(plain), plain)

    def test_non_string_input_passes_through(self):
        self.assertIsNone(_strip_reasoning(None))


if __name__ == "__main__":
    unittest.main()
