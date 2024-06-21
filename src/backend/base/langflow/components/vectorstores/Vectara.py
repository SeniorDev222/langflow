from typing import List

from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara

from langflow.base.vectorstores.model import LCVectorStoreComponent
from langflow.helpers.data import docs_to_data
from langflow.io import BoolInput, IntInput, StrInput, SecretStrInput, DataInput, MultilineInput
from langflow.schema import Data


class VectaraVectorStoreComponent(LCVectorStoreComponent):
    display_name = "Vectara"
    description = "Vectara Vector Store with search capabilities"
    documentation = "https://python.langchain.com/docs/modules/data_connection/vectorstores/integrations/vectara"
    icon = "Vectara"

    inputs = [
        StrInput(name="vectara_customer_id", display_name="Vectara Customer ID", required=True),
        StrInput(name="vectara_corpus_id", display_name="Vectara Corpus ID", required=True),
        SecretStrInput(name="vectara_api_key", display_name="Vectara API Key", required=True),
        DataInput(
            name="vector_store_inputs",
            display_name="Vector Store Inputs",
            is_list=True,
        ),
        BoolInput(
            name="add_to_vector_store",
            display_name="Add to Vector Store",
            info="If true, the Vector Store Inputs will be added to the Vector Store.",
        ),
        MultilineInput(name="search_input", display_name="Search Input"),
        IntInput(
            name="number_of_results",
            display_name="Number of Results",
            info="Number of results to return.",
            value=4,
            advanced=True,
        ),
    ]

    def build_vector_store(self) -> Vectara:
        return self._build_vectara()

    def _build_vectara(self) -> Vectara:
        source = "Langflow"

        if self.add_to_vector_store:
            documents = []
            for _input in self.vector_store_inputs or []:
                if isinstance(_input, Data):
                    documents.append(_input.to_lc_document())
                else:
                    documents.append(_input)

            if documents:
                return Vectara.from_documents(
                    documents=documents,
                    embedding=FakeEmbeddings(size=768),
                    vectara_customer_id=self.vectara_customer_id,
                    vectara_corpus_id=self.vectara_corpus_id,
                    vectara_api_key=self.vectara_api_key,
                    source=source,
                )

        return Vectara(
            vectara_customer_id=self.vectara_customer_id,
            vectara_corpus_id=self.vectara_corpus_id,
            vectara_api_key=self.vectara_api_key,
            source=source,
        )

    def search_documents(self) -> List[Data]:
        vector_store = self._build_vectara()

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
