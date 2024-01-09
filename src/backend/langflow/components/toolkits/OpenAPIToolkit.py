from langflow import CustomComponent
from langflow.field_typing import AgentExecutor
from typing import Callable
from langchain_community.utilities.requests import TextRequestsWrapper
from langchain_community.agent_toolkits.openapi.toolkit import OpenAPIToolkit


class OpenAPIToolkitComponent(CustomComponent):
    display_name = "OpenAPIToolkit"
    description = "Toolkit for interacting with an OpenAPI API."

    def build_config(self):
        return {
            "json_agent": {"display_name": "JSON Agent"},
            "requests_wrapper": {"display_name": "Text Requests Wrapper"},
        }

    def build(
        self,
        json_agent: AgentExecutor,
        requests_wrapper: TextRequestsWrapper,
    ) -> Callable:
        # Assuming the actual toolkit class name is OpenAPIToolkit
        return OpenAPIToolkit(json_agent=json_agent, requests_wrapper=requests_wrapper)
