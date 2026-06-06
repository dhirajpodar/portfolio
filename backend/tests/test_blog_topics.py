"""Unit tests for the get_blog_topics agent tool (issue #37 — blog post dates).

These assert that publish dates are exposed to the agent and that posts are
ordered newest-first. This verifies data exposure, not the full end-to-end
behavioural acceptance criteria (which needs a live LLM call).

Dummy API keys are set before importing app.agent because the module builds the
LLM clients at import time (no network call is made at construction).

Run from backend/:  python -m unittest tests.test_blog_topics
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault("GEMINI_API_KEY", "test-dummy")
os.environ.setdefault("GROQ_API_KEY", "test-dummy")

from app.agent import get_blog_topics  # noqa: E402
from app.blog import load_all_posts  # noqa: E402


class BlogTopicsTests(unittest.TestCase):
    def test_output_includes_publish_date_for_every_post(self):
        output = get_blog_topics.invoke({})
        posts = load_all_posts()
        self.assertTrue(posts, "expected at least one blog post to test against")
        for post in posts:
            self.assertIn(post["date"], output)

    def test_posts_are_listed_newest_first(self):
        output = get_blog_topics.invoke({})
        posts = load_all_posts()
        positions = [output.index(p["title"]) for p in posts]
        # load_all_posts() already returns newest-first; the tool must preserve it.
        self.assertEqual(positions, sorted(positions))
        dates = [p["date"] for p in posts]
        self.assertEqual(dates, sorted(dates, reverse=True))


if __name__ == "__main__":
    unittest.main()
