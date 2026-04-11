"""
Runtime document store for PageIndex.

Loads pre-built JSON tree structures from content/indexed/ at import time.
Provides retrieval functions that the agent tools and showcase endpoints use.
No external dependencies — only stdlib json/os/logging.
"""

import json
import os
import logging

from app.pageindex.retrieve import (
    get_document as _get_document,
    get_document_structure as _get_document_structure,
    get_page_content as _get_page_content,
    remove_fields,
)

logger = logging.getLogger(__name__)

INDEXED_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "content",
    "indexed",
)

_documents: dict[str, dict] = {}


def _load_documents():
    """Load all pre-built JSON tree structures from disk."""
    if not os.path.exists(INDEXED_DIR):
        logger.warning(f"Indexed directory not found: {INDEXED_DIR}")
        return

    for filename in sorted(os.listdir(INDEXED_DIR)):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(INDEXED_DIR, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            doc_id = data.get("doc_id", filename.replace(".json", ""))
            _documents[doc_id] = data
            logger.info(f"Loaded PageIndex document: {doc_id}")
        except Exception as e:
            logger.error(f"Failed to load {filename}: {e}")


_load_documents()


def get_catalog() -> str:
    """Return a JSON list of all indexed documents with metadata."""
    catalog = []
    for doc_id, doc_info in _documents.items():
        catalog.append({
            "doc_id": doc_id,
            "doc_name": doc_info.get("doc_name", ""),
            "doc_description": doc_info.get("doc_description", ""),
            "type": doc_info.get("type", "markdown"),
            "line_count": doc_info.get("line_count", 0),
        })
    return json.dumps(catalog, ensure_ascii=False)


def get_structure(doc_id: str) -> str:
    """Return the tree structure of a document (no full text, saves tokens)."""
    return _get_document_structure(_documents, doc_id)


def get_content(doc_id: str, pages: str) -> str:
    """Return full text content for specific line ranges of a document."""
    return _get_page_content(_documents, doc_id, pages)


def get_document_info(doc_id: str) -> str:
    """Return metadata for a specific document."""
    return _get_document(_documents, doc_id)


def get_all_documents() -> dict:
    """Return the raw documents dict (for showcase endpoints)."""
    return _documents


def get_tree_without_text(doc_id: str) -> list:
    """Return tree structure with text stripped (for showcase endpoints)."""
    doc_info = _documents.get(doc_id)
    if not doc_info:
        return []
    return remove_fields(doc_info.get("structure", []), fields=("text",))
