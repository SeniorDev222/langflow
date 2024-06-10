from typing import Optional

from langflow.base.io.chat import ChatComponent
from langflow.schema.message import Message


class ChatInput(ChatComponent):
    display_name = "Chat Input"
    description = "Get chat inputs from the Playground."
    icon = "ChatInput"

    def build_config(self):
        build_config = super().build_config()
        build_config["input_value"] = {
            "input_types": [],
            "display_name": "Message",
            "multiline": True,
        }

        return build_config

    def build(
        self,
        sender: Optional[str] = "User",
        sender_name: Optional[str] = "User",
        input_value: Optional[str] = None,
        files: Optional[list[str]] = None,
        session_id: Optional[str] = None,
    ) -> Message:
        return super().build_with_record(
            sender=sender,
            sender_name=sender_name,
            input_value=input_value,
            files=files,
            session_id=session_id,
        )
