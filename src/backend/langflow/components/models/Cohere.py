from langchain_community.chat_models.cohere import ChatCohere
from langflow import CustomComponent
from langflow.field_typing import Text


class CohereComponent(CustomComponent):
    display_name = "Cohere model"
    description = "Generate text using Cohere large language models."
    documentation = "https://python.langchain.com/docs/modules/model_io/models/llms/integrations/cohere"

    def build_config(self):
        return {
            "cohere_api_key": {"display_name": "Cohere API Key", "type": "password", "password": True},
            "max_tokens": {"display_name": "Max Tokens", "default": 256, "type": "int", "show": True},
            "temperature": {"display_name": "Temperature", "default": 0.75, "type": "float", "show": True},
            "inputs": {"display_name": "Input"},
        }

    def build(
        self,
        cohere_api_key: str,
        inputs: str,
        max_tokens: int = 256,
        temperature: float = 0.75,
    ) -> Text:
        output = ChatCohere(cohere_api_key=cohere_api_key, max_tokens=max_tokens, temperature=temperature)
        message = output.invoke(inputs)
        result = message.content if hasattr(message, "content") else message
        self.status = result
        return result
