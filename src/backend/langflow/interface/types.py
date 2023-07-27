from langflow.interface.agents.base import agent_creator
from langflow.interface.chains.base import chain_creator
from langflow.interface.custom.constants import CUSTOM_COMPONENT_SUPPORTED_TYPES
from langflow.interface.document_loaders.base import documentloader_creator
from langflow.interface.embeddings.base import embedding_creator
from langflow.interface.importing.utils import get_function_custom
from langflow.interface.llms.base import llm_creator
from langflow.interface.memories.base import memory_creator
from langflow.interface.prompts.base import prompt_creator
from langflow.interface.text_splitters.base import textsplitter_creator
from langflow.interface.toolkits.base import toolkits_creator
from langflow.interface.tools.base import tool_creator
from langflow.interface.utilities.base import utility_creator
from langflow.interface.vector_store.base import vectorstore_creator
from langflow.interface.wrappers.base import wrapper_creator
from langflow.interface.output_parsers.base import output_parser_creator
from langflow.interface.custom.base import custom_component_creator
from langflow.interface.custom.custom_component import CustomComponent

from langflow.template.field.base import TemplateField
from langflow.template.frontend_node.constants import CLASSES_TO_REMOVE
from langflow.template.frontend_node.custom_components import (
    CustomComponentFrontendNode,
)
from langflow.interface.retrievers.base import retriever_creator

from langflow.interface.custom.directory_reader import DirectoryReader
from langflow.utils.logger import logger
from langflow.utils.util import get_base_classes
from langflow.api.utils import merge_nested_dicts

import re
import warnings
import traceback
from fastapi import HTTPException


# Used to get the base_classes list
def get_type_list():
    """Get a list of all langchain types"""
    all_types = build_langchain_types_dict()

    # all_types.pop("tools")

    for key, value in all_types.items():
        all_types[key] = [item["template"]["_type"] for item in value.values()]

    return all_types


def build_langchain_types_dict():  # sourcery skip: dict-assign-update-to-union
    """Build a dictionary of all langchain types"""
    all_types = {}

    creators = [
        chain_creator,
        agent_creator,
        prompt_creator,
        llm_creator,
        memory_creator,
        tool_creator,
        toolkits_creator,
        wrapper_creator,
        embedding_creator,
        vectorstore_creator,
        documentloader_creator,
        textsplitter_creator,
        utility_creator,
        output_parser_creator,
        retriever_creator,
        custom_component_creator,
    ]

    all_types = {}
    for creator in creators:
        created_types = creator.to_dict()
        if created_types[creator.type_name].values():
            all_types.update(created_types)

    return all_types


def process_type(field_type: str):
    return "prompt" if field_type == "Prompt" else field_type


# TODO: Move to correct place
def add_new_custom_field(
    template,
    field_name: str,
    field_type: str,
    field_value: str,
    field_required: bool,
    field_config: dict,
):
    # Check field_config if any of the keys are in it
    # if it is, update the value
    display_name = field_config.pop("display_name", field_name)
    field_type = field_config.pop("field_type", field_type)
    field_type = process_type(field_type)
    field_value = field_config.pop("value", field_value)
    field_advanced = field_config.pop("advanced", False)

    if "name" in field_config:
        warnings.warn(
            "The 'name' key in field_config is used to build the object and can't be changed."
        )
        field_config.pop("name", None)

    required = field_config.pop("required", field_required)
    placeholder = field_config.pop("placeholder", "")

    new_field = TemplateField(
        name=field_name,
        field_type=field_type,
        value=field_value,
        show=True,
        required=required,
        advanced=field_advanced,
        placeholder=placeholder,
        display_name=display_name,
        **field_config,
    )
    template.get("template")[field_name] = new_field.to_dict()
    template.get("custom_fields")[field_name] = None

    return template


# TODO: Move to correct place
def add_code_field(template, raw_code, field_config):
    # Field with the Python code to allow update

    code_field = {
        "code": {
            "dynamic": True,
            "required": True,
            "placeholder": "",
            "show": True,
            "multiline": True,
            "value": raw_code,
            "password": False,
            "name": "code",
            "advanced": field_config.pop("advanced", False),
            "type": "code",
            "list": False,
        }
    }
    template.get("template")["code"] = code_field.get("code")

    return template


def extract_type_from_optional(field_type):
    """
    Extract the type from a string formatted as "Optional[<type>]".

    Parameters:
    field_type (str): The string from which to extract the type.

    Returns:
    str: The extracted type, or an empty string if no type was found.
    """
    match = re.search(r"\[(.*?)\]", field_type)
    return match[1] if match else None


def build_frontend_node(custom_component: CustomComponent):
    """Build a frontend node for a custom component"""
    try:
        return (
            CustomComponentFrontendNode().to_dict().get(type(custom_component).__name__)
        )

    except Exception as exc:
        logger.error(f"Error while building base frontend node: {exc}")
        return None


def update_display_name_and_description(frontend_node, template_config):
    """Update the display name and description of a frontend node"""
    if "display_name" in template_config:
        frontend_node["display_name"] = template_config["display_name"]

    if "description" in template_config:
        frontend_node["description"] = template_config["description"]


def build_field_config(custom_component):
    """Build the field configuration for a custom component"""
    try:
        custom_class = get_function_custom(custom_component.code)
        return custom_class().build_config()

    except Exception as exc:
        logger.error(f"Error while building field config: {exc}")
        return {}


def add_extra_fields(frontend_node, field_config, function_args):
    """Add extra fields to the frontend node"""
    if function_args is None:
        return
    # sort function_args which is a list of dicts
    function_args.sort(key=lambda x: x["name"])

    for extra_field in function_args:
        if "name" not in extra_field or extra_field["name"] == "self":
            continue

        field_name, field_type, field_value, field_required = get_field_properties(
            extra_field
        )
        config = field_config.get(field_name, {})
        frontend_node = add_new_custom_field(
            frontend_node,
            field_name,
            field_type,
            field_value,
            field_required,
            config,
        )


def get_field_properties(extra_field):
    """Get the properties of an extra field"""
    field_name = extra_field["name"]
    field_type = extra_field.get("type", "str")
    field_value = extra_field.get("default", "")
    field_required = "optional" not in field_type.lower()

    if not field_required:
        field_type = extract_type_from_optional(field_type)

    return field_name, field_type, field_value, field_required


def add_base_classes(frontend_node, return_type):
    """Add base classes to the frontend node"""
    if return_type not in CUSTOM_COMPONENT_SUPPORTED_TYPES or return_type is None:
        raise HTTPException(
            status_code=400,
            detail={
                "error": (
                    "Invalid return type should be one of: "
                    f"{list(CUSTOM_COMPONENT_SUPPORTED_TYPES.keys())}"
                ),
                "traceback": traceback.format_exc(),
            },
        )

    return_type_instance = CUSTOM_COMPONENT_SUPPORTED_TYPES.get(return_type)
    base_classes = get_base_classes(return_type_instance)

    for base_class in base_classes:
        if base_class not in CLASSES_TO_REMOVE:
            frontend_node.get("base_classes").append(base_class)


def build_langchain_template_custom_component(custom_component: CustomComponent):
    """Build a custom component template for the langchain"""
    frontend_node = build_frontend_node(custom_component)

    if frontend_node is None:
        return None

    template_config = custom_component.build_template_config

    update_display_name_and_description(frontend_node, template_config)

    field_config = build_field_config(custom_component)
    add_extra_fields(
        frontend_node, field_config, custom_component.get_function_entrypoint_args
    )

    frontend_node = add_code_field(
        frontend_node, custom_component.code, field_config.get("code", {})
    )

    add_base_classes(
        frontend_node, custom_component.get_function_entrypoint_return_type
    )

    return frontend_node


def load_files_from_path(path: str):
    """Load all files from a given path"""
    reader = DirectoryReader(path, False)

    return reader.get_files()


def build_and_validate_all_files(reader, file_list):
    """Build and validate all files"""
    data = reader.build_component_menu_list(file_list)
    valid_components = reader.filter_loaded_components(data=data, with_errors=False)

    invalid_components = reader.filter_loaded_components(data=data, with_errors=True)

    return valid_components, invalid_components


def build_valid_menu(valid_components):
    """Build the valid menu"""
    valid_menu = {}
    for menu_item in valid_components["menu"]:
        menu_name = menu_item["name"]
        valid_menu[menu_name] = {}

        for component in menu_item["components"]:
            try:
                component_name = component["name"]
                component_code = component["code"]

                component_extractor = CustomComponent(code=component_code)
                component_extractor.is_check_valid()
                component_template = build_langchain_template_custom_component(
                    component_extractor
                )

                valid_menu[menu_name][component_name] = component_template

            except Exception as exc:
                logger.error(f"Error while building custom component: {exc}")

    return valid_menu


def build_invalid_menu(invalid_components):
    """Build the invalid menu"""
    invalid_menu = {}
    for menu_item in invalid_components["menu"]:
        menu_name = menu_item["name"]
        invalid_menu[menu_name] = {}

        for component in menu_item["components"]:
            try:
                component_name = component["name"]
                component_code = component["code"]

                component_template = (
                    CustomComponentFrontendNode(
                        description="ERROR - Check your Python Code",
                        display_name=f"ERROR - {component_name}",
                    )
                    .to_dict()
                    .get(type(CustomComponent()).__name__)
                )

                component_template.get("template").get("code")["value"] = component_code

                invalid_menu[menu_name][component_name] = component_template

            except Exception as exc:
                logger.error(f"Error while creating custom component: {exc}")

    return invalid_menu


def build_langchain_custom_component_list_from_path(path: str):
    """Build a list of custom components for the langchain from a given path"""
    file_list = load_files_from_path(path)
    reader = DirectoryReader(path, False)

    valid_components, invalid_components = build_and_validate_all_files(
        reader, file_list
    )

    valid_menu = build_valid_menu(valid_components)
    invalid_menu = build_invalid_menu(invalid_components)

    return merge_nested_dicts(valid_menu, invalid_menu)
