from fastapi import APIRouter

from langchain import chains
from langchain import agents
from langchain import prompts
from langchain import llms
from langchain import utilities
from langchain.chains.conversation import memory as memories
from langchain import document_loaders
from langchain import vectorstores
from langchain import docstore
from langchain.agents.load_tools import (
    _BASE_TOOLS,
    _LLM_TOOLS,
    _EXTRA_LLM_TOOLS,
    _EXTRA_OPTIONAL_TOOLS,
)
import util


# build router
router = APIRouter(
    prefix="/list",
    tags=["list"],
)


@router.get("/")
def read_items():
    return [
        "chains",
        "agents",
        "prompts",
        "llms",
        # "utilities",
        "memories",
        # "document_loaders",
        # "vectorstores",
        # "docstores",
        "tools",
    ]


@router.get("/chains")
def list_chains():
    """List all chain types"""
    return [
        chain.__annotations__["return"].__name__
        for chain in chains.loading.type_to_loader_dict.values()
    ]


@router.get("/agents")
def list_agents():
    """List all agent types"""
    # return list(agents.loading.AGENT_TO_CLASS.keys())
    return [agent.__name__ for agent in agents.loading.AGENT_TO_CLASS.values()]


@router.get("/prompts")
def list_prompts():
    """List all prompt types"""
    return [
        prompt.__annotations__["return"].__name__
        for prompt in prompts.loading.type_to_loader_dict.values()
    ]


@router.get("/llms")
def list_llms():
    """List all llm types"""
    return [llm.__name__ for llm in llms.type_to_cls_dict.values()]


@router.get("/memories")
def list_memories():
    """List all memory types"""
    return [memory.__name__ for memory in memories.type_to_cls_dict.values()]


# @router.get("/utilities")
# def list_utilities():
#     """List all utility types"""
#     return list(utilities.__all__)


# @router.get("/document_loaders")
# def list_document_loaders():
#     """List all document loader types"""
#     return list(document_loaders.__all__)


# @router.get("/vectorstores")
# def list_vectorstores():
#     """List all vector store types"""
#     return list(vectorstores.__all__)


# @router.get("/docstores")
# def list_docstores():
#     """List all document store types"""
#     return list(docstore.__all__)


@router.get("/tools")
def list_tools():
    """List all load tools"""

    merged_dict = {
        **_BASE_TOOLS,
        **_LLM_TOOLS,
        **{k: v[0] for k, v in _EXTRA_LLM_TOOLS.items()},
        **{k: v[0] for k, v in _EXTRA_OPTIONAL_TOOLS.items()},
    }

    return {k: util.get_tool_params(v) for k, v in merged_dict.items()}
