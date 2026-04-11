"""
Runtime retrieval for PageIndex indexed documents.
No external dependencies — works with pre-built JSON trees only.
"""

import json


def _remove_fields(data, fields=("text",)):
    """Recursively remove specified fields from nested dicts/lists."""
    if isinstance(data, dict):
        return {k: _remove_fields(v, fields) for k, v in data.items() if k not in fields}
    elif isinstance(data, list):
        return [_remove_fields(item, fields) for item in data]
    return data


def _parse_pages(pages: str) -> list[int]:
    """Parse a pages string like '5-7', '3,8', or '12' into a sorted list of ints."""
    result = []
    for part in pages.split(","):
        part = part.strip()
        if "-" in part:
            start, end = (
                int(part.split("-", 1)[0].strip()),
                int(part.split("-", 1)[1].strip()),
            )
            if start > end:
                raise ValueError(f"Invalid range '{part}': start must be <= end")
            result.extend(range(start, end + 1))
        else:
            result.append(int(part))
    return sorted(set(result))


def _get_md_page_content(doc_info: dict, page_nums: list[int]) -> list[dict]:
    """
    For Markdown documents, 'pages' are line numbers.
    Find nodes whose line_num falls within [min(page_nums), max(page_nums)]
    and return their text.
    """
    min_line, max_line = min(page_nums), max(page_nums)
    results = []
    seen = set()

    def _traverse(nodes):
        for node in nodes:
            ln = node.get("line_num")
            if ln and min_line <= ln <= max_line and ln not in seen:
                seen.add(ln)
                results.append({"page": ln, "content": node.get("text", "")})
            if node.get("nodes"):
                _traverse(node["nodes"])

    _traverse(doc_info.get("structure", []))
    results.sort(key=lambda x: x["page"])
    return results


def get_document(documents: dict, doc_id: str) -> str:
    """Return JSON with document metadata."""
    doc_info = documents.get(doc_id)
    if not doc_info:
        return json.dumps({"error": f"Document {doc_id} not found"})
    return json.dumps({
        "doc_id": doc_id,
        "doc_name": doc_info.get("doc_name", ""),
        "doc_description": doc_info.get("doc_description", ""),
        "type": doc_info.get("type", "markdown"),
        "line_count": doc_info.get("line_count", 0),
    })


def get_document_structure(documents: dict, doc_id: str) -> str:
    """Return tree structure JSON with text fields removed (saves tokens)."""
    doc_info = documents.get(doc_id)
    if not doc_info:
        return json.dumps({"error": f"Document {doc_id} not found"})
    structure = doc_info.get("structure", [])
    return json.dumps(_remove_fields(structure, fields=("text",)), ensure_ascii=False)


def get_page_content(documents: dict, doc_id: str, pages: str) -> str:
    """
    Retrieve content for a markdown document by line numbers.

    pages format: '5-7', '3,8', or '12'
    Ranges are inclusive: '5-20' returns all nodes with line_num in [5, 20].
    Line numbers correspond to node headers in the tree structure.

    Returns JSON list of {'page': int, 'content': str}.
    """
    doc_info = documents.get(doc_id)
    if not doc_info:
        return json.dumps({"error": f"Document {doc_id} not found"})

    try:
        page_nums = _parse_pages(pages)
    except (ValueError, AttributeError) as e:
        return json.dumps({"error": f'Invalid pages format: {pages!r}. Error: {e}'})

    try:
        content = _get_md_page_content(doc_info, page_nums)
    except Exception as e:
        return json.dumps({"error": f"Failed to read page content: {e}"})

    return json.dumps(content, ensure_ascii=False)
