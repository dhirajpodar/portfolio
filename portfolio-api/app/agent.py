from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

from app.config import settings
from app.profile_data import EXPERIENCE, PROJECTS, SKILLS, EDUCATION, CONTACT


@tool
def get_experience() -> str:
    """Get Dhiraj Poddar's complete work experience and employment history."""
    return EXPERIENCE


@tool
def get_projects() -> str:
    """Get details about Dhiraj Poddar's key projects including CostData and MAiQ."""
    return PROJECTS


@tool
def get_skills() -> str:
    """Get Dhiraj Poddar's categorized technical skills across AI/ML, backend, cloud, frontend, and databases."""
    return SKILLS


@tool
def get_education() -> str:
    """Get Dhiraj Poddar's educational background."""
    return EDUCATION


@tool
def get_contact() -> str:
    """Get Dhiraj Poddar's contact information including email, LinkedIn, GitHub, and location."""
    return CONTACT


SYSTEM_PROMPT = (
    "You are an AI assistant on Dhiraj Poddar's portfolio website. "
    "You have access to tools that provide detailed information about Dhiraj's professional background. "
    "Use these tools to answer visitor questions accurately. "
    "Be professional, helpful, and concise. "
    "When appropriate, highlight Dhiraj's key achievements and encourage visitors to connect with him. "
    "Do not make up information — only use what the tools provide."
)

tools = [get_experience, get_projects, get_skills, get_education, get_contact]

memory = MemorySaver()

llm = ChatGroq(
    api_key=settings.GROQ_API_KEY,
    model=settings.MODEL_NAME,
    temperature=0.3,
    streaming=True,
)

agent = create_react_agent(
    model=llm,
    tools=tools,
    checkpointer=memory,
    prompt=SYSTEM_PROMPT,
)
