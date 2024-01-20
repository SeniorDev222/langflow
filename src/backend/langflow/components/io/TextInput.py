from typing import Optional

from langflow import CustomComponent
from langflow.field_typing import Text


class TextInput(CustomComponent):
    display_name = "Text Input"
    description = "Used to pass text input to the next component."

    field_config = {
        "code": {
            "show": False,
        },
        "value": {"display_name": "Value"},
    }

    def build(self, value: Optional[str] = "") -> Text:
        self.status = value
        if not value:
            value = ""
        return value
