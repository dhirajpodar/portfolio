"""
Converts profile_data.py constants into a structured markdown document
with proper heading hierarchy for PageIndex tree indexing.
"""

import os
import sys
from pathlib import Path

# Add project root to path for imports
_project_root = str(Path(__file__).resolve().parent.parent)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from app.profile_data import (
    EXPERIENCE,
    PROJECTS,
    SKILLS,
    EDUCATION,
    PERSONAL_INTERESTS,
    CONTACT,
)


def generate_profile_markdown() -> str:
    """Generate a structured markdown document from profile data constants."""
    sections = []

    sections.append("# Dhiraj Poddar - Full Stack AI Engineer\n")

    # Professional Summary
    sections.append("## Professional Summary\n")
    sections.append(
        "AI Software Engineer who builds production AI platforms — from LangGraph "
        "agent orchestration and RAG pipelines to cloud-native deployment on Azure. "
        "4+ years across backend engineering, AI/ML systems, and cloud-native deployment. "
        "Core engineer on a production SaaS platform with agentic AI workflows. "
        "First employee at Maindtec AI startup.\n"
    )

    # Work Experience
    sections.append("## Work Experience\n")

    sections.append("### Maindtec - Agentic AI Engineer (Jan 2025-Present)\n")
    sections.append(
        "- Core team building MAiQ, an AI SaaS platform: FastAPI modular monolith (DDD), "
        "LangGraph agent orchestration with autonomous tool-calling, and Azure cloud infrastructure with Bicep IaC\n"
        "- Implemented hybrid RAG pipeline — BM25 full-text + pgvector semantic search + Cohere reranking\n"
        "- Led and delivered a production AI agent end-to-end in 3 months for an external customer\n"
        "- Built GPU-accelerated 2D technical drawing analysis with YOLO object detection, Transformer OCR, and GPT vision on AKS\n"
        "- Implemented multi-tenant RBAC with SSO (OIDC/SAML) and JWT-based stateless session management\n"
        "- Built production observability with Application Insights, Prometheus, LangSmith, PostHog\n"
        "- First employee at the startup\n"
    )

    sections.append(
        "### Siemens AG - Working Student AI Engineer (Sep 2024-Dec 2024)\n"
    )
    sections.append(
        "- Developed and implemented various time series forecasting models and evaluated their performance\n"
        "- Assessed model robustness by applying perturbation methods such as Brownian, Gaussian noise, rotation, etc.\n"
        "- Implemented a dashboard application for the demonstration of model performance\n"
    )

    sections.append("### Siemens AG - Master Thesis Student (Mar 2024-Aug 2024)\n")
    sections.append(
        "- Topic: Robustness of Large Language Models\n"
        "- Integrated various open source NLP models from Hugging Face for machine translation, paraphrasing and tokenization\n"
        "- Implemented text data augmentation methods: synonym replacement, backtranslation, paraphrasing\n"
        "- Investigated evaluation metrics BERTScore, BLEURT, BARTScore on open source QA datasets\n"
        "- Implemented RAG pipeline to extract information for Siemens dataset\n"
        "- Libraries: PyTorch, transformers, NLTK, open source data augmentation libraries\n"
    )

    sections.append(
        "### Siemens AG - Working Student Data Scientist (Feb 2023-Feb 2024)\n"
    )
    sections.append(
        "- Implemented and integrated AI models using TensorFlow and PyTorch, leading to 20% increase in prediction accuracy for PCB board soldering defect classification\n"
        "- Maintained and deployed ML models using Siemens deployment infrastructures (AI inference server, AI monitor)\n"
    )

    sections.append("### Citytech - Software Developer (Apr 2019-Oct 2020)\n")
    sections.append("- Fintech POS apps for 5+ banks\n")

    # Projects
    sections.append("## Projects\n")

    sections.append(
        "### CNN-Generated Image Detection (FAU, Nov 2022-Mar 2023)\n"
    )
    sections.append(
        "Universal detector to distinguish real vs CNN-generated images from 11 different generator models. "
        "Reproduced results from S. Wang et al. paper. Used ResNet50 and GoogleNet trained on ImageNet with PyTorch. "
        "Evaluated with Accuracy and Average Precision metrics.\n"
    )

    sections.append("### Dynamic Form Library (Citytech, Oct 2019-Feb 2020)\n")
    sections.append(
        "Library to generate dynamic forms from JSON via API at runtime. Single-screen and multi-screen forms (ViewPager). "
        "Custom layouts for TextView, EditText, Checkbox, RadioButtons, Image, Map, Signature fields. "
        "Observer pattern with EventBus.\n"
    )

    sections.append("### MLOps End-to-End\n")
    sections.append(
        "Gemstone price prediction using LinearRegression, Ridge, Lasso, RandomForest — 98% accuracy. "
        "Full MLOps: scikit-learn, Docker, MLflow, Airflow, DVC, CI/CD, GitHub, DagsHub, Azure.\n"
    )

    sections.append("### Dimensionality Reduction using Deep Learning (MANIT)\n")
    sections.append(
        "Autoencoder models for Big Data dimensionality reduction. Combined t-SNE with autoencoder to minimize reconstruction loss.\n"
    )

    sections.append("### Wind Energy Forecasting (MANIT)\n")
    sections.append(
        "ARIMA modeling of long time series in MATLAB. Autocorrelation and non-stationarity detection in pre-whitened time series.\n"
    )

    sections.append("### Cracked Windows Image Recognition (FAU, Jun-Jul 2022)\n")
    sections.append(
        "Classification of cracked window images using PyTorch/CNN. F-Score 0.65.\n"
    )

    # Skills
    sections.append("## Skills\n")

    sections.append("### AI and Machine Learning\n")
    sections.append(
        "LangGraph, LangChain, LangSmith, RAG, pgvector, Cohere, PyTorch, YOLO, Transformers, OpenCV, Multi-Agent Systems\n"
    )

    sections.append("### Backend Development\n")
    sections.append(
        "Python, FastAPI, SQLAlchemy, Pydantic, Redis, Celery, Alembic\n"
    )

    sections.append("### Cloud and DevOps\n")
    sections.append(
        "Azure (Container Apps, AKS, OpenAI, Key Vault, VNet), Docker, Bicep IaC, GitHub Actions, KEDA, Prometheus\n"
    )

    sections.append("### Frontend\n")
    sections.append(
        "TypeScript, Next.js, React, Redux, TailwindCSS, Framer Motion\n"
    )

    sections.append("### Databases\n")
    sections.append("PostgreSQL, Redis, pgvector\n")

    # Education
    sections.append("## Education\n")

    sections.append(
        "### MSc Data Science - FAU Erlangen-Nurnberg (2021-2024)\n"
    )
    sections.append(
        "Friedrich-Alexander-Universitat Erlangen-Nurnberg (FAU)\n"
    )

    sections.append(
        "### BTech Computer Science - MANIT Bhopal (2014-2018)\n"
    )
    sections.append(
        "Maulana Azad National Institute of Technology (MANIT) Bhopal\n"
    )

    # Personal Interests
    sections.append("## Beyond Work\n")
    sections.append(
        "- Passionate problem-solver — genuinely enjoys breaking down complex challenges and finding elegant solutions\n"
        "- Constant learner — always picking up new frameworks, research papers, or different domains\n"
        "- Builder at heart — loves shipping things, taking ideas from zero to working product\n"
        "- Enthusiastic about engineering — it's not just a job, it's what he looks forward to every day\n"
        "- Art of Living Foundation volunteer — contributes to community well-being and personal development initiatives\n"
    )

    # Contact
    sections.append("## Contact\n")
    sections.append(
        "- Email: dhirajpoddar@outlook.com\n"
        "- LinkedIn: linkedin.com/in/dhiraj-poddar/\n"
        "- GitHub: github.com/dhirajpodar\n"
        "- Location: Ingolstadt, Germany\n"
    )

    return "\n".join(sections)


def save_profile_markdown(output_path: str) -> str:
    """Generate and save the profile markdown to disk."""
    content = generate_profile_markdown()
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)
    return output_path


if __name__ == "__main__":
    output = os.path.join(
        os.path.dirname(__file__), "..", "..", "content", "indexed", "profile.md"
    )
    save_profile_markdown(output)
    print(f"Profile markdown saved to: {output}")
