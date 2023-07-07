from langchain import PromptTemplate
from langchain.chains.base import Chain
from langchain.document_loaders.base import BaseLoader
from langchain.embeddings.base import Embeddings
from langchain.llms.base import BaseLLM
from langchain.schema import BaseRetriever, Document
from langchain.text_splitter import TextSplitter
from langchain.tools import Tool
from langchain.vectorstores.base import VectorStore


LANGCHAIN_BASE_TYPES = {
    "Chain": Chain,
    "Tool": Tool,
    "BaseLLM": BaseLLM,
    "PromptTemplate": PromptTemplate,
    "BaseLoader": BaseLoader,
    "Document": Document,
    "TextSplitter": TextSplitter,
    "VectorStore": VectorStore,
    "Embeddings": Embeddings,
    "BaseRetriever": BaseRetriever,
}
DEFAULT_CUSTOM_COMPONENT_CODE = """
from langchain.chains import LLMChain
from langflow.interface.custom import CustomComponent
from langchain.schema import Document
import requests

class YourComponent(CustomComponent):
    display_name: str = "Your Component"
    description: str = "Your description"
    field_config = { "url": { "multiline": True, "required": True } }

    def build(self, url: str, llm: BaseLLM, prompt: prompt) -> Document:
        response = requests.get(url)
        chain = LLMChain(llm=llm, prompt=prompt)
        result = chain.run(response.text)
        return Document(page_content=str(result))
"""
