from langflow import CustomComponent

from langchain.llms.base import BaseLLM
from langchain import PromptTemplate
from langchain.schema import Document


class PromptRunner(CustomComponent):
    display_name: str = "Prompt Runner"
    description: str = "Run a Chain with the given PromptTemplate"
    beta = True
    field_config = {
        "llm": {"display_name": "LLM"},
        "prompt": {
            "display_name": "Prompt Template",
            "info": "Make sure the prompt has all variables filled.",
        },
        "code": {"show": False},
        "inputs": {"field_type": "code"},
    }

    def build(
        self,
        llm: BaseLLM,
        prompt: PromptTemplate,
    ) -> Document:
        chain = prompt | llm
        result = chain.invoke()
        result = result[chain.output_key]
        self.repr_value = result
        return Document(page_content=str(result))
