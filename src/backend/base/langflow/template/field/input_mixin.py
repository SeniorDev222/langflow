from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from langflow.field_typing.range_spec import RangeSpec


class FieldTypes(str, Enum):
    TEXT = "str"
    INTEGER = "int"
    PASSWORD = "SecretStr"
    FLOAT = "float"
    BOOLEAN = "bool"
    DICT = "dict"
    NESTED_DICT = "NestedDict"
    FILE = "file"
    PROMPT = "Prompt"


# Base mixin for common input field attributes and methods
class BaseInputMixin(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    field_type: Optional[FieldTypes] = Field(default=FieldTypes.TEXT)

    required: bool = False
    """Specifies if the field is required. Defaults to False."""

    placeholder: str = ""
    """A placeholder string for the field. Default is an empty string."""

    show: bool = True
    """Should the field be shown. Defaults to True."""

    value: Any = None
    """The value of the field. Default is None."""

    name: Optional[str] = None
    """Name of the field. Default is an empty string."""

    display_name: Optional[str] = None
    """Display name of the field. Defaults to None."""

    advanced: bool = False
    """Specifies if the field will an advanced parameter (hidden). Defaults to False."""

    input_types: Optional[list[str]] = None
    """List of input types for the handle when the field has more than one type. Default is an empty list."""

    dynamic: bool = False
    """Specifies if the field is dynamic. Defaults to False."""

    info: Optional[str] = ""
    """Additional information about the field to be shown in the tooltip. Defaults to an empty string."""

    real_time_refresh: Optional[bool] = None
    """Specifies if the field should have real time refresh. `refresh_button` must be False. Defaults to None."""

    refresh_button: Optional[bool] = None
    """Specifies if the field should have a refresh button. Defaults to False."""
    refresh_button_text: Optional[str] = None
    """Specifies the text for the refresh button. Defaults to None."""

    title_case: bool = False
    """Specifies if the field should be displayed in title case. Defaults to True."""

    def to_dict(self):
        return self.model_dump(exclude_none=True)

    @field_validator("field_type", mode="before")
    @classmethod
    def validate_field_type(cls, v):
        if v not in FieldTypes:
            raise ValueError(f"field_type must be one of {FieldTypes}")
        return FieldTypes(v)


# Mixin for input fields that can be listable
class ListableInputMixin(BaseModel):
    is_list: bool = Field(default=False)


# Specific mixin for fields needing database interaction
class DatabaseLoadMixin(BaseModel):
    load_from_db: bool = Field(default=False)


# Specific mixin for fields needing file interaction
class FileMixin(BaseModel):
    file_path: Optional[str] = Field(default="")
    file_types: list[str] = Field(default=[], serialization_alias="fileTypes")

    @field_validator("file_types")
    @classmethod
    def validate_file_types(cls, v):
        if not isinstance(v, list):
            raise ValueError("file_types must be a list")
        # types should be a list of extensions without the dot
        for file_type in v:
            if not isinstance(file_type, str):
                raise ValueError("file_types must be a list of strings")
            if file_type.startswith("."):
                raise ValueError("file_types should not start with a dot")
        return v


class RangeMixin(BaseModel):
    range_spec: Optional[RangeSpec] = None


class DropDownMixin(BaseModel):
    options: Optional[list[str]] = None
    """List of options for the field. Only used when is_list=True. Default is an empty list."""
