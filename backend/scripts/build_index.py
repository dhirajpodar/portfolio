#!/usr/bin/env python3
"""
Build script for PageIndex tree structures.

Generates a structured markdown from profile data, then runs md_to_tree()
on all content (profile + blog posts) with Groq via LiteLLM.
Saves pre-built JSON trees to content/indexed/ for runtime use.

Usage:
    cd portfolio-api
    GROQ_API_KEY=your_key python3 scripts/build_index.py
"""

import asyncio
import json
import os
import sys

# Add project root and scripts dir to path
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPTS_DIR)
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, SCRIPTS_DIR)

from profile_to_markdown import save_profile_markdown
from page_index_md import md_to_tree

MODEL = "groq/moonshotai/kimi-k2-instruct"
SUMMARY_TOKEN_THRESHOLD = 200
INDEXED_DIR = os.path.join(PROJECT_ROOT, "content", "indexed")
POSTS_DIR = os.path.join(PROJECT_ROOT, "content", "posts")

# Groq rate limit: use a semaphore to limit concurrent LLM calls
MAX_CONCURRENT = 3
semaphore = asyncio.Semaphore(MAX_CONCURRENT)


async def index_document(md_path: str, doc_id: str) -> dict:
    """Index a single markdown document into a tree structure."""
    async with semaphore:
        print(f"\n{'='*60}")
        print(f"Indexing: {doc_id}")
        print(f"Source:   {md_path}")
        print(f"{'='*60}")

        tree = await md_to_tree(
            md_path=md_path,
            if_thinning=False,
            if_add_node_summary="yes",
            summary_token_threshold=SUMMARY_TOKEN_THRESHOLD,
            model=MODEL,
            if_add_doc_description="yes",
            if_add_node_text="yes",
            if_add_node_id="yes",
        )

        tree["type"] = "markdown"
        tree["doc_id"] = doc_id

        output_path = os.path.join(INDEXED_DIR, f"{doc_id}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(tree, f, indent=2, ensure_ascii=False)

        node_count = count_nodes(tree.get("structure", []))
        print(f"Done: {doc_id} ({node_count} nodes, {tree.get('line_count', 0)} lines)")
        return tree


def count_nodes(structure) -> int:
    """Count total nodes in a tree structure."""
    count = 0
    if isinstance(structure, dict):
        count = 1
        if "nodes" in structure:
            count += count_nodes(structure["nodes"])
    elif isinstance(structure, list):
        for item in structure:
            count += count_nodes(item)
    return count


async def main():
    os.makedirs(INDEXED_DIR, exist_ok=True)

    # Step 1: Generate profile markdown from profile_data.py
    profile_md_path = os.path.join(INDEXED_DIR, "profile.md")
    print("Generating profile markdown...")
    save_profile_markdown(profile_md_path)
    print(f"Saved: {profile_md_path}")

    # Step 2: Collect all documents to index
    documents = [
        (profile_md_path, "profile"),
    ]

    for filename in sorted(os.listdir(POSTS_DIR)):
        if filename.endswith(".md"):
            slug = filename.replace(".md", "")
            doc_id = f"blog-{slug}"
            documents.append((os.path.join(POSTS_DIR, filename), doc_id))

    print(f"\nDocuments to index: {len(documents)}")
    for md_path, doc_id in documents:
        print(f"  - {doc_id}: {os.path.basename(md_path)}")

    # Step 3: Index sequentially to respect Groq rate limits
    results = []
    for md_path, doc_id in documents:
        result = await index_document(md_path, doc_id)
        results.append(result)

    print(f"\n{'='*60}")
    print("BUILD COMPLETE")
    print(f"{'='*60}")
    print(f"Documents indexed: {len(results)}")
    for result in results:
        node_count = count_nodes(result.get("structure", []))
        print(
            f"  - {result.get('doc_id', 'unknown')}: "
            f"{node_count} nodes, {result.get('line_count', 0)} lines"
        )
    print(f"\nOutput directory: {INDEXED_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
