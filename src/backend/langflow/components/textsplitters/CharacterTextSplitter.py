
from langflow import CustomComponent
from langchain.document_transformers import TextSplitter
from langchain.documents import Document
from typing import List


class CharacterTextSplitterComponent(CustomComponent):
    display_name = "CharacterTextSplitter"
    description = "Splitting text that looks at characters."

    def build_config(self):
        return {
            "documents": {"display_name": "Documents"},
            "chunk_overlap": {"display_name": "Chunk Overlap", "default": 200},
            "chunk_size": {"display_name": "Chunk Size", "default": 1000},
            "separator": {"display_name": "Separator", "default": "\n"},
        }

    def build(
        self,
        documents: List[Document],
        chunk_overlap: int = 200,
        chunk_size: int = 1000,
        separator: str = "\n",
    ) -> TextSplitter:
        return TextSplitter(
            documents=documents,
            chunk_overlap=chunk_overlap,
            chunk_size=chunk_size,
            separator=separator,
        )
