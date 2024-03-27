from typing import Optional

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.language_models.llms import LLM
from langchain_core.messages import HumanMessage, SystemMessage

from langflow.custom import CustomComponent


class LCModelComponent(CustomComponent):
    display_name: str = "Model Name"
    description: str = "Model Description"

    def get_result(self, runnable: LLM, stream: bool, input_value: str):
        """
        Retrieves the result from the output of a Runnable object.

        Args:
            output (Runnable): The output object to retrieve the result from.
            stream (bool): Indicates whether to use streaming or invocation mode.
            input_value (str): The input value to pass to the output object.

        Returns:
            The result obtained from the output object.
        """
        if stream:
            result = runnable.stream(input_value)
        else:
            message = runnable.invoke(input_value)
            result = message.content if hasattr(message, "content") else message
            self.status = result
        return result

    def get_chat_result(
        self, runnable: BaseChatModel, stream: bool, input_value: str, system_message: Optional[str] = None
    ):
        messages = []
        if input_value:
            messages.append(HumanMessage(input_value))
        if system_message:
            messages.append(SystemMessage(system_message))
        if stream:
            result = runnable.stream(messages)
        else:
            message = runnable.invoke(messages)
            result = message.content
            self.status = result
        return result
