// ─── Types ───────────────────────────────────────────────────────────────────

export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  badges?: string[];
  bullets: string[];
  tech: string[];
}

export interface ProjectMetric {
  value: string;
  label: string;
}

export interface Project {
  name: string;
  tagline: string;
  role: string;
  metrics: ProjectMetric[];
  highlights: string[];
  tech: string[];
}

export interface SkillCategory {
  name: string;
  icon: string;
  skills: string[];
}

export interface Education {
  degree: string;
  university: string;
  location: string;
  period: string;
  courses: string[];
}

// ─── Personal Info ───────────────────────────────────────────────────────────

export const PERSONAL = {
  name: "Dhiraj Poddar",
  title: "Agentic AI Engineer",
  location: "Ingolstadt, Germany",
  email: "dhirajpoddar@outlook.com",
  linkedin: "https://www.linkedin.com/in/dhiraj-poddar/",
  github: "https://github.com/dhirajpodar",
} as const;

// ─── Experience ──────────────────────────────────────────────────────────────

export const EXPERIENCE: Experience[] = [
  {
    role: "Agentic AI Engineer",
    company: "MAindTec GmbH (AI Startup)",
    location: "Ingolstadt",
    period: "Jan 2025 – Present",
    badges: ["Current", "First Employee"],
    bullets: [
      "Core team building MAiQ AI SaaS platform: FastAPI modular monolith (DDD), LangGraph agentic workflows, Azure cloud infrastructure with Bicep IaC",
      "Implemented hybrid RAG pipeline — BM25 full-text + pgvector semantic search + Cohere reranking — with event-driven workers on Redis Streams, Stripe billing, and SharePoint integration",
      "Led and delivered a production AI agent end-to-end in 3 months for an external customer",
      "Built GPU-accelerated 2D technical drawing analysis with YOLO object detection, Transformer OCR, and GPT vision on AKS",
      "Implemented testing and evaluation pipelines for AI agents using LangSmith; set up PostHog analytics for LLM service monitoring",
    ],
    tech: ["LangGraph", "FastAPI", "Azure", "Next.js", "PostgreSQL", "Redis", "Docker"],
  },
  {
    role: "Working Student AI Engineer",
    company: "Siemens AG",
    location: "Munich (Remote)",
    period: "Sep 2024 – Dec 2024",
    bullets: [
      "Developed and implemented various time series forecasting models and evaluated their performance",
      "Assessed model robustness by applying perturbation methods such as Brownian, Gaussian noise, rotation",
      "Implemented a dashboard application for the demonstration of model performance",
    ],
    tech: ["Python", "PyTorch", "Time Series", "Dashboard"],
  },
  {
    role: "Master Thesis Student",
    company: "Siemens AG",
    location: "Munich",
    period: "Mar 2024 – Aug 2024",
    bullets: [
      "Researched Robustness of Large Language Models",
      "Integrated open source NLP models from Hugging Face for machine translation, paraphrasing and tokenization",
      "Implemented text data augmentation methods: synonym replacement, backtranslation, paraphrasing",
      "Investigated evaluation metrics BERTScore, BLEURT, BARTScore on open source QA datasets",
      "Implemented RAG pipeline to extract information for Siemens dataset",
    ],
    tech: ["RAG", "LLMs", "Transformers", "PyTorch", "NLTK", "Hugging Face"],
  },
  {
    role: "Working Student Data Scientist",
    company: "Siemens AG",
    location: "Erlangen (On-site)",
    period: "Feb 2023 – Feb 2024",
    bullets: [
      "Implemented and integrated AI models using TensorFlow and PyTorch, leading to 20% increase in prediction accuracy for PCB board soldering defect classification",
      "Maintained and deployed ML models using Siemens deployment infrastructures (AI inference server, AI monitor)",
    ],
    tech: ["TensorFlow", "PyTorch", "Computer Vision", "MLOps"],
  },
  {
    role: "Software Developer",
    company: "Citytech",
    location: "Bagmati, Nepal",
    period: "Apr 2019 – Oct 2020",
    bullets: [
      "Developed POS mobile applications in native Android (Java/Kotlin) used by 5+ banks",
      "Built dynamic form generation library from APIs, reducing form generation time by 30%",
      "Worked in agile development environment using Jira for project management",
    ],
    tech: ["Java", "Kotlin", "Android", "Fintech", "Jira"],
  },
];

// ─── Projects ────────────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  {
    name: "CNN-Generated Image Detection",
    tagline: "Universal detector to distinguish real vs CNN-generated images from 11 generator models",
    role: "Researcher — FAU Erlangen-Nürnberg",
    metrics: [
      { value: "11", label: "Generator Models" },
      { value: "ResNet50", label: "Primary Architecture" },
      { value: "PyTorch", label: "Framework" },
    ],
    highlights: [
      "Developed universal detector for real vs CNN-generated images across 11 different generator models",
      "Reproduced and extended results from S. Wang et al. paper using same models and datasets",
      "Used ResNet50 and GoogleNet pretrained on ImageNet for feature extraction",
      "Evaluated with Accuracy and Average Precision metrics; explored additional architectures and metrics beyond the original paper",
    ],
    tech: ["PyTorch", "ResNet50", "GoogleNet", "ImageNet", "CNN"],
  },
  {
    name: "Dynamic Form Library",
    tagline: "Runtime form generation from JSON APIs with multi-screen support",
    role: "Software Developer — Citytech",
    metrics: [
      { value: "8+", label: "Custom Field Types" },
      { value: "2", label: "Form Modes" },
      { value: "30%", label: "Dev Time Saved" },
    ],
    highlights: [
      "Built forms generated from JSON via API at runtime",
      "Supported single-screen (Normal) and multi-screen forms (ViewPager)",
      "Created custom layouts: TextView, EditText, Checkbox, CheckboxGroup, RadioButtons, Image, Map, Signature",
      "Used observer pattern with EventBus for image, fingerprint, and signature capture",
    ],
    tech: ["Java", "Kotlin", "Android", "EventBus", "ViewPager"],
  },
  {
    name: "MLOps End-to-End Pipeline",
    tagline: "Full MLOps pipeline for gemstone price prediction with 98% accuracy",
    role: "ML Engineer",
    metrics: [
      { value: "98%", label: "Accuracy" },
      { value: "4", label: "ML Models" },
      { value: "E2E", label: "MLOps Pipeline" },
    ],
    highlights: [
      "Regression pipeline using LinearRegression, Ridge, Lasso, and RandomForest",
      "Full MLOps stack with experiment tracking, data versioning, and CI/CD",
      "Containerized with Docker, deployed on Azure",
    ],
    tech: ["scikit-learn", "Docker", "MLflow", "Airflow", "DVC", "GitHub", "DagsHub", "Azure"],
  },
  {
    name: "Dimensionality Reduction using Deep Learning",
    tagline: "Autoencoder + t-SNE approach for Big Data dimensionality reduction",
    role: "Researcher — MANIT Bhopal",
    metrics: [
      { value: "t-SNE", label: "Visualization" },
      { value: "Autoencoder", label: "Architecture" },
    ],
    highlights: [
      "Addressed high-dimensionality challenges in Big Data",
      "Used various autoencoder models to reduce reconstruction loss",
      "Combined t-SNE with autoencoder to further decrease dimensionality reduction loss",
    ],
    tech: ["Deep Learning", "Autoencoder", "t-SNE", "Python"],
  },
  {
    name: "Wind Energy Forecasting",
    tagline: "Time series forecasting with ARIMA modeling in MATLAB",
    role: "Researcher — MANIT Bhopal",
    metrics: [
      { value: "ARIMA", label: "Model" },
      { value: "MATLAB", label: "Platform" },
    ],
    highlights: [
      "ARIMA modeling of long time series for wind energy prediction",
      "Autocorrelation and non-stationarity detection in pre-whitened time series",
      "Validated using magnetoencephalography recordings",
    ],
    tech: ["MATLAB", "ARIMA", "Time Series", "Signal Processing"],
  },
  {
    name: "Cracked Windows Image Recognition",
    tagline: "Image classification of cracked windows using CNN",
    role: "Researcher — FAU Erlangen-Nürnberg",
    metrics: [
      { value: "0.65", label: "F-Score" },
      { value: "3", label: "Image Classes" },
    ],
    highlights: [
      "Classification of three types of cracked window images",
      "Implemented using PyTorch and CNN architecture",
    ],
    tech: ["PyTorch", "CNN", "Computer Vision"],
  },
];

// ─── Skills ──────────────────────────────────────────────────────────────────

export const SKILLS: SkillCategory[] = [
  {
    name: "AI / Machine Learning",
    icon: "Brain",
    skills: [
      "LangGraph",
      "LangChain",
      "LangSmith",
      "RAG",
      "pgvector",
      "Cohere",
      "PyTorch",
      "YOLO",
      "Transformers",
      "OpenCV",
      "Prompt Engineering",
      "Multi-Agent Systems",
    ],
  },
  {
    name: "Backend",
    icon: "Server",
    skills: [
      "Python",
      "FastAPI",
      "SQLAlchemy",
      "Pydantic",
      "Redis",
      "Celery",
      "Gunicorn/Uvicorn",
      "Alembic",
    ],
  },
  {
    name: "Cloud & DevOps",
    icon: "Cloud",
    skills: [
      "Azure Container Apps",
      "AKS",
      "Azure OpenAI",
      "Key Vault",
      "VNet",
      "Docker",
      "Bicep IaC",
      "GitHub Actions",
      "KEDA",
      "Prometheus",
    ],
  },
  {
    name: "Frontend",
    icon: "Layout",
    skills: [
      "TypeScript",
      "Next.js 15",
      "React 19",
      "Redux Toolkit",
      "TailwindCSS",
      "Framer Motion",
      "Stripe",
      "SSE Streaming",
    ],
  },
  {
    name: "Databases",
    icon: "Database",
    skills: [
      "PostgreSQL 16",
      "Redis 7",
      "pgvector",
      "Multi-Schema Architecture",
      "Alembic Migrations",
    ],
  },
];

// ─── Education ───────────────────────────────────────────────────────────────

export const EDUCATION: Education[] = [
  {
    degree: "MSc Data Science",
    university: "Friedrich Alexander Universität Erlangen-Nürnberg",
    location: "Erlangen, Germany",
    period: "2021 – 2024",
    courses: [
      "Artificial Intelligence",
      "Pattern Recognition",
      "Deep Learning",
      "ML in Time Series",
      "Explainable AI",
      "Business Intelligence",
    ],
  },
  {
    degree: "BTech Computer Science",
    university: "MANIT Bhopal",
    location: "Bhopal, India",
    period: "2014 – 2018",
    courses: [
      "Data Structures & Algorithms",
      "Data Mining",
      "Digital Image Processing",
      "NLP",
      "OOP Design",
    ],
  },
];

// ─── About / Hero ───────────────────────────────────────────────────────────

export const ABOUT_SUMMARY =
  "I'm a full-stack AI engineer with 4+ years of experience building production AI platforms. As the first engineer at an AI startup, I ship LangGraph multi-agent systems, hybrid RAG pipelines, and Azure cloud infrastructure end-to-end. From GPU-accelerated computer vision to real-time AI streaming with a Next.js frontend — I own the stack from model to user.";

export const STATS = [
  { value: "4+", label: "Years Experience" },
  { value: "6+", label: "AI Projects Shipped" },
  { value: "3", label: "Countries Worked In" },
  { value: "2", label: "Degrees" },
];

export const HERO_TITLES = [
  "Agentic AI Engineer",
  "Full-Stack Builder",
  "RAG Pipeline Architect",
  "Cloud-Native Developer",
];

// ─── Navigation ──────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: "Chat", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;

// ─── Aliases (for cross-component compatibility) ─────────────────────────────

export const experiences = EXPERIENCE;
export const projects = PROJECTS;
export const skillCategories = SKILLS;
export const education = EDUCATION;
