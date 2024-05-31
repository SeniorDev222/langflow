from typing import Any, Union, Generator
from enum import Enum

from langchain_core.documents import Document
from langflow.schema.schema import Record
from pydantic import BaseModel

from langflow.interface.utils import extract_input_variables_from_prompt


class UnbuiltObject:
    pass


class UnbuiltResult:
    pass


class ArtifactType(str, Enum):
    TEXT = "text"
    RECORD = "record"
    OBJECT = "object"
    STREAM = "stream"
    UNKNOWN = "unknown"


def validate_prompt(prompt: str):
    """Validate prompt."""
    if extract_input_variables_from_prompt(prompt):
        return prompt

    return fix_prompt(prompt)


def fix_prompt(prompt: str):
    """Fix prompt."""
    return prompt + " {input}"


def flatten_list(list_of_lists: list[Union[list, Any]]) -> list:
    """Flatten list of lists."""
    new_list = []
    for item in list_of_lists:
        if isinstance(item, list):
            new_list.extend(item)
        else:
            new_list.append(item)
    return new_list


def serialize_field(value):
    """Unified serialization function for handling both BaseModel and Document types,
    including handling lists of these types."""
    if isinstance(value, (list, tuple)):
        return [serialize_field(v) for v in value]
    elif isinstance(value, Document):
        return value.to_json()
    elif isinstance(value, BaseModel):
        return value.model_dump()
    elif isinstance(value, str):
        return {"result": value}
    return value


def get_artifact_type(custom_component, build_result) -> str:
    result = ArtifactType.UNKNOWN
    value = custom_component.repr_value
    match value:
        case Record():
            result = ArtifactType.RECORD

        case str():
            result = ArtifactType.TEXT

        case dict():
            result = ArtifactType.OBJECT

    if result == ArtifactType.UNKNOWN:
        if isinstance(build_result, Generator):
            result = ArtifactType.STREAM

    return result.value
