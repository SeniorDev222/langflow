from typing import List

from langflow.custom import Component
from langflow.inputs import DropdownInput, StrInput, IntInput
from langflow.template import Output
from langflow.memory import get_messages
from langflow.schema import Data
from langflow.field_typing import Text


class MemoryComponent(Component):
    display_name = "Memory"
    description = "Retrieves stored chat messages."
    icon = "history"

    inputs = [
        DropdownInput(
            name="sender",
            display_name="Sender Type",
            options=["Machine", "User", "Machine and User"],
            value="Machine and User",
            info="Type of sender.",
            advanced=True,
        ),
        StrInput(
            name="sender_name",
            display_name="Sender Name",
            info="Name of the sender.",
            advanced=True,
        ),
        IntInput(
            name="n_messages",
            display_name="Number of Messages",
            value=100,
            info="Number of messages to retrieve.",
            advanced=True,
        ),
        StrInput(
            name="session_id",
            display_name="Session ID",
            info="Session ID of the chat history.",
            advanced=True,
        ),
        DropdownInput(
            name="order",
            display_name="Order",
            options=["Ascending", "Descending"],
            value="Descending",
            info="Order of the messages.",
            advanced=True,
        ),
    ]

    outputs = [
        Output(display_name="Messages", name="messages", method="retrieve_messages"),
        Output(display_name="Text", name="messages_text", method="retrieve_messages_as_text"),
    ]

    def retrieve_messages(self) -> List[Data]:
        sender = self.sender
        sender_name = self.sender_name
        session_id = self.session_id
        n_messages = self.n_messages
        order = "DESC" if self.order == "Descending" else "ASC"

        if sender == "Machine and User":
            sender = None

        messages = get_messages(
            sender=sender,
            sender_name=sender_name,
            session_id=session_id,
            limit=n_messages,
            order=order,
        )
        self.status = messages
        return messages

    def retrieve_messages_as_text(self) -> Text:
        messages = self.retrieve_messages()
        messages_text = "\n".join(
            [f"{message.data.get('sender_name')}: {message.data.get('text')}" for message in messages]
        )
        self.status = messages_text
        return Text(messages_text)
