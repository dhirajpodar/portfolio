"""
Vendored from VectifyAI/PageIndex — utils.py
Modified: removed PDF-specific imports (PyPDF2, pymupdf) and functions.
Only markdown-related utilities retained.
"""

import litellm
import logging
import os
import textwrap
import time
import json
import asyncio
from dotenv import load_dotenv

load_dotenv()
import yaml
from pathlib import Path
from types import SimpleNamespace as config

litellm.drop_params = True


def count_tokens(text, model=None):
    if not text:
        return 0
    return litellm.token_counter(model=model, text=text)


def _parse_retry_after(error_msg: str) -> float:
    """Extract retry-after seconds from Groq rate limit error, fallback to 0."""
    import re
    match = re.search(r"try again in ([\d.]+)s", str(error_msg).lower())
    return float(match.group(1)) if match else 0


def llm_completion(model, prompt, chat_history=None, return_finish_reason=False):
    if model:
        model = model.removeprefix("litellm/")
    max_retries = 10
    messages = (
        list(chat_history) + [{"role": "user", "content": prompt}]
        if chat_history
        else [{"role": "user", "content": prompt}]
    )
    for i in range(max_retries):
        try:
            response = litellm.completion(
                model=model,
                messages=messages,
                temperature=0,
            )
            content = response.choices[0].message.content
            if return_finish_reason:
                finish_reason = (
                    "max_output_reached"
                    if response.choices[0].finish_reason == "length"
                    else "finished"
                )
                return content, finish_reason
            return content
        except Exception as e:
            logging.error(f"LLM completion error (attempt {i+1}): {e}")
            if i < max_retries - 1:
                wait = max(_parse_retry_after(e), 2 ** i)
                logging.info(f"Retrying in {wait:.1f}s...")
                time.sleep(wait)
            else:
                logging.error("Max retries reached for prompt: " + prompt[:100])
                if return_finish_reason:
                    return "", "error"
                return ""


async def llm_acompletion(model, prompt):
    if model:
        model = model.removeprefix("litellm/")
    max_retries = 10
    messages = [{"role": "user", "content": prompt}]
    for i in range(max_retries):
        try:
            response = await litellm.acompletion(
                model=model,
                messages=messages,
                temperature=0,
            )
            return response.choices[0].message.content
        except Exception as e:
            logging.error(f"LLM async completion error (attempt {i+1}): {e}")
            if i < max_retries - 1:
                wait = max(_parse_retry_after(e), 2 ** i)
                logging.info(f"Retrying in {wait:.1f}s...")
                await asyncio.sleep(wait)
            else:
                logging.error("Max retries reached for prompt: " + prompt[:100])
                return ""


def write_node_id(data, node_id=0):
    if isinstance(data, dict):
        data["node_id"] = str(node_id).zfill(4)
        node_id += 1
        for key in list(data.keys()):
            if "nodes" in key:
                node_id = write_node_id(data[key], node_id)
    elif isinstance(data, list):
        for index in range(len(data)):
            node_id = write_node_id(data[index], node_id)
    return node_id


def structure_to_list(structure):
    if isinstance(structure, dict):
        nodes = []
        nodes.append(structure)
        if "nodes" in structure:
            nodes.extend(structure_to_list(structure["nodes"]))
        return nodes
    elif isinstance(structure, list):
        nodes = []
        for item in structure:
            nodes.extend(structure_to_list(item))
        return nodes


def remove_fields(data, fields=["text"]):
    if isinstance(data, dict):
        return {
            k: remove_fields(v, fields) for k, v in data.items() if k not in fields
        }
    elif isinstance(data, list):
        return [remove_fields(item, fields) for item in data]
    return data


async def generate_node_summary(node, model=None):
    prompt = f"""You are given a part of a document, your task is to generate a description of the partial document about what are main points covered in the partial document.

    Partial Document Text: {node['text']}

    Directly return the description, do not include any other text.
    """
    response = await llm_acompletion(model, prompt)
    return response


async def generate_summaries_for_structure(structure, model=None):
    nodes = structure_to_list(structure)
    tasks = [generate_node_summary(node, model=model) for node in nodes]
    summaries = await asyncio.gather(*tasks)

    for node, summary in zip(nodes, summaries):
        node["summary"] = summary
    return structure


def create_clean_structure_for_description(structure):
    if isinstance(structure, dict):
        clean_node = {}
        for key in ["title", "node_id", "summary", "prefix_summary"]:
            if key in structure:
                clean_node[key] = structure[key]
        if "nodes" in structure and structure["nodes"]:
            clean_node["nodes"] = create_clean_structure_for_description(
                structure["nodes"]
            )
        return clean_node
    elif isinstance(structure, list):
        return [create_clean_structure_for_description(item) for item in structure]
    else:
        return structure


def generate_doc_description(structure, model=None):
    prompt = f"""Your are an expert in generating descriptions for a document.
    You are given a structure of a document. Your task is to generate a one-sentence description for the document, which makes it easy to distinguish the document from other documents.

    Document Structure: {structure}

    Directly return the description, do not include any other text.
    """
    response = llm_completion(model, prompt)
    return response


def reorder_dict(data, key_order):
    if not key_order:
        return data
    return {key: data[key] for key in key_order if key in data}


def format_structure(structure, order=None):
    if not order:
        return structure
    if isinstance(structure, dict):
        if "nodes" in structure:
            structure["nodes"] = format_structure(structure["nodes"], order)
        if not structure.get("nodes"):
            structure.pop("nodes", None)
        structure = reorder_dict(structure, order)
    elif isinstance(structure, list):
        structure = [format_structure(item, order) for item in structure]
    return structure


class ConfigLoader:
    def __init__(self, default_path: str = None):
        if default_path is None:
            default_path = Path(__file__).parent / "pageindex_config.yaml"
        self._default_dict = self._load_yaml(default_path)

    @staticmethod
    def _load_yaml(path):
        with open(path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}

    def _validate_keys(self, user_dict):
        unknown_keys = set(user_dict) - set(self._default_dict)
        if unknown_keys:
            raise ValueError(f"Unknown config keys: {unknown_keys}")

    def load(self, user_opt=None) -> config:
        if user_opt is None:
            user_dict = {}
        elif isinstance(user_opt, config):
            user_dict = vars(user_opt)
        elif isinstance(user_opt, dict):
            user_dict = user_opt
        else:
            raise TypeError("user_opt must be dict, config(SimpleNamespace) or None")

        self._validate_keys(user_dict)
        merged = {**self._default_dict, **user_dict}
        return config(**merged)


def print_toc(tree, indent=0):
    for node in tree:
        print("  " * indent + node["title"])
        if node.get("nodes"):
            print_toc(node["nodes"], indent + 1)


def print_json(data, max_len=40, indent=2):
    def simplify_data(obj):
        if isinstance(obj, dict):
            return {k: simplify_data(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [simplify_data(item) for item in obj]
        elif isinstance(obj, str) and len(obj) > max_len:
            return obj[:max_len] + "..."
        else:
            return obj

    simplified = simplify_data(data)
    print(json.dumps(simplified, indent=indent, ensure_ascii=False))


def print_tree(tree, indent=0):
    for node in tree:
        summary = node.get("summary") or node.get("prefix_summary", "")
        summary_str = f"  --  {summary[:60]}..." if summary else ""
        print(
            "  " * indent
            + f"[{node.get('node_id', '?')}] {node.get('title', '')}{summary_str}"
        )
        if node.get("nodes"):
            print_tree(node["nodes"], indent + 1)
