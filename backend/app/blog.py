import re
from pathlib import Path

import frontmatter

CONTENT_DIR = Path(__file__).parent.parent / "content" / "posts"


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s]+", "-", text)
    return text


def extract_headings(markdown: str) -> list[dict]:
    headings = []
    for match in re.finditer(r"^(#{2,3})\s+(.+)$", markdown, re.MULTILINE):
        level = len(match.group(1))
        text = match.group(2).strip()
        headings.append({"id": slugify(text), "text": text, "level": level})
    return headings


REQUIRED_FIELDS = ("title", "excerpt", "tags", "date", "readTime")


def load_post(slug: str) -> dict | None:
    path = CONTENT_DIR / f"{slug}.md"
    if not path.exists():
        return None
    post = frontmatter.load(str(path))
    if not all(f in post.metadata for f in REQUIRED_FIELDS):
        return None
    return {
        "slug": slug,
        "title": post.metadata["title"],
        "excerpt": post.metadata["excerpt"],
        "tags": post.metadata["tags"],
        "date": post.metadata["date"],
        "readTime": post.metadata["readTime"],
        "content": post.content,
        "headings": extract_headings(post.content),
    }


def load_all_posts() -> list[dict]:
    posts = []
    for path in CONTENT_DIR.glob("*.md"):
        slug = path.stem
        post = frontmatter.load(str(path))
        if not all(f in post.metadata for f in REQUIRED_FIELDS):
            continue
        posts.append({
            "slug": slug,
            "title": post.metadata["title"],
            "excerpt": post.metadata["excerpt"],
            "tags": post.metadata["tags"],
            "date": post.metadata["date"],
            "readTime": post.metadata["readTime"],
        })
    posts.sort(key=lambda p: p["date"], reverse=True)
    return posts


def get_all_tags(posts: list[dict]) -> list[str]:
    tags = set()
    for p in posts:
        tags.update(p["tags"])
    return ["All"] + sorted(tags)
