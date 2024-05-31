from langflow.custom import CustomComponent
from langflow.template.field.base import Input, Output


class MultipleOutputsComponent(CustomComponent):
    inputs = [
        Input(display_name="Input", name="input", field_type=str),
        Input(display_name="Number", name="number", field_type=int),
    ]
    outputs = [
        Output(display_name="Certain Output", method="certain_output", name="certain_output"),
        Output(name="Other Output", method="other_output"),
    ]

    def certain_output(self) -> str:
        return f"This is my string input: {self.input}"

    def other_output(self) -> int:
        return f"This is my int input multiplied by 2: {self.number * 2}"
