from typing import List

from langchain_community.vectorstores import UpstashVectorStore
from langchain.schema import BaseRetriever

from langflow.custom import Component
from langflow.schema import Data
from langflow.inputs import BoolInput, IntInput, StrInput, HandleInput
from langflow.template import Output
from langflow.helpers.data import docs_to_data

class UpstashVectorStoreComponent(Component):
    display_name = "Upstash"
    description = "Upstash Vector Store with search capabilities"
    documentation = "https://python.langchain.com/docs/modules/data_connection/vectorstores/integrations/upstash"
    icon = "Upstash"

    inputs = [
        StrInput(name="index_url", display_name="Index URL", info="The URL of the Upstash index.", required=True),
        StrInput(name="index_token", display_name="Index Token", info="The token for the Upstash index.", required=True),
        StrInput(name="text_key", display_name="Text Key", info="The key in the record to use as text.", value="text", advanced=True),
        HandleInput(name="embedding", display_name="Embedding", input_types=["Embeddings"], info="To use Upstash's embeddings, don't provide an embedding."),
        HandleInput(name="vector_store_inputs", display_name="Vector Store Inputs", input_types=["Document", "Data"], is_list=True),
        BoolInput(name="add_to_vector_store", display_name="Add to Vector Store", info="If true, the Vector Store Inputs will be added to the Vector Store."),
        StrInput(name="search_input", display_name="Search Input"),
        IntInput(name="number_of_results", display_name="Number of Results", info="Number of results to return.", value=4, advanced=True),
    ]

    outputs = [
        Output(display_name="Vector Store", name="vector_store", method="build_vector_store", output_type=UpstashVectorStore),
        Output(display_name="Base Retriever", name="base_retriever", method="build_base_retriever", output_type=BaseRetriever),
        Output(display_name="Search Results", name="search_results", method="search_documents"),
    ]

    def build_vector_store(self) -> UpstashVectorStore:
        return self._build_upstash()

    def build_base_retriever(self) -> BaseRetriever:
        return self._build_upstash()

    def _build_upstash(self) -> UpstashVectorStore:
        use_upstash_embedding = self.embedding is None

        if self.add_to_vector_store:
            documents = []
            for _input in self.vector_store_inputs or []:
                if isinstance(_input, Data):
                    documents.append(_input.to_lc_document())
                else:
                    documents.append(_input)

            if documents:
                if use_upstash_embedding:
                    upstash_vs = UpstashVectorStore(
                        embedding=use_upstash_embedding,
                        text_key=self.text_key,
                        index_url=self.index_url,
                        index_token=self.index_token,
                    )
                    upstash_vs.add_documents(documents)
                else:
                    upstash_vs = UpstashVectorStore.from_documents(
                        documents=documents,
                        embedding=self.embedding,
                        text_key=self.text_key,
                        index_url=self.index_url,
                        index_token=self.index_token,
                    )
            else:
                upstash_vs = UpstashVectorStore(
                    embedding=self.embedding or use_upstash_embedding,
                    text_key=self.text_key,
                    index_url=self.index_url,
                    index_token=self.index_token,
                )
        else:
            upstash_vs = UpstashVectorStore(
                embedding=self.embedding or use_upstash_embedding,
                text_key=self.text_key,
                index_url=self.index_url,
                index_token=self.index_token,
            )

        return upstash_vs

    def search_documents(self) -> List[Data]:
        vector_store = self._build_upstash()

        if self.search_input and isinstance(self.search_input, str) and self.search_input.strip():
            docs = vector_store.similarity_search(
                query=self.search_input,
                k=self.number_of_results,
            )

            data = docs_to_data(docs)
            self.status = data
            return data
        else:
            return []
