from typing import Optional

from langchain.chains import LLMChain, LLMMathChain

from langflow import CustomComponent
from langflow.field_typing import BaseLanguageModel, BaseMemory, Text


class LLMMathChainComponent(CustomComponent):
    display_name = "LLMMathChain"
    description = "Chain that interprets a prompt and executes python code to do math."
    documentation = (
        "https://python.langchain.com/docs/modules/chains/additional/llm_math"
    )

    def build_config(self):
        return {
            "llm": {"display_name": "LLM"},
            "llm_chain": {"display_name": "LLM Chain"},
            "memory": {"display_name": "Memory"},
            "input_key": {"display_name": "Input Key"},
            "output_key": {"display_name": "Output Key"},
        }

    def build(
        self,
        inputs: Text,
        llm: BaseLanguageModel,
        llm_chain: LLMChain,
        input_key: str = "question",
        output_key: str = "answer",
        memory: Optional[BaseMemory] = None,
    ) -> Text:
        chain = LLMMathChain(
            llm=llm,
            llm_chain=llm_chain,
            input_key=input_key,
            output_key=output_key,
            memory=memory,
        )
        response = chain.invoke({input_key: inputs})
        result = response.get(output_key)
        self.status = result
        return result
