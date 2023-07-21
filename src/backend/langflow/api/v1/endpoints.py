from http import HTTPStatus
from typing import Optional

from langflow.cache.utils import save_uploaded_file
from langflow.database.models.flow import Flow
from langflow.processing.process import process_graph_cached, process_tweaks
from langflow.utils.logger import logger
from langflow.settings import settings

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from langflow.interface.custom.custom_component import CustomComponent

from langflow.interface.custom.load_custom_component_from_path import (
    CustomComponentPathValueError,
)

from langflow.api.v1.schemas import (
    ProcessResponse,
    UploadFileResponse,
    CustomComponentCode,
)

from langflow.interface.types import (
    build_langchain_types_dict,
    build_langchain_template_custom_component,
    build_langchain_custom_component_list_from_path,
)

from langflow.database.base import get_session
from sqlmodel import Session

# build router
router = APIRouter(tags=["Base"])


# TODO: Move to correct local
def merge_nested_dicts(dict1, dict2):
    for key, value in dict2.items():
        if isinstance(value, dict) and isinstance(dict1.get(key), dict):
            dict1[key] = merge_nested_dicts(dict1[key], value)
        else:
            dict1[key] = value
    return dict1


@router.get("/all")
def get_all():
    native_components = build_langchain_types_dict()

    if settings.component_path:
        # TODO: Iterate in a list of component_path
        custom_components_from_file = build_langchain_custom_component_list_from_path(
            str(settings.component_path[0])
        )
    else:
        custom_components_from_file = {}

    return merge_nested_dicts(native_components, custom_components_from_file)


@router.get("/load_custom_component_from_path")
def get_load_custom_component_from_path(path: str):
    try:
        data = build_langchain_custom_component_list_from_path(path)
    except CustomComponentPathValueError as err:
        raise HTTPException(
            status_code=400,
            detail={"error": type(err).__name__, "traceback": str(err)},
        ) from err

    return data


@router.get("/load_custom_component_from_path_TEST")
def get_load_custom_component_from_path_test(path: str):
    from langflow.interface.custom.load_custom_component_from_path import (
        DirectoryReader,
    )

    reader = DirectoryReader(path, False)
    file_list = reader.get_files()
    data = reader.build_component_menu_list(file_list)

    return reader.filter_loaded_components(data, True)


# For backwards compatibility we will keep the old endpoint
@router.post("/predict/{flow_id}", response_model=ProcessResponse)
@router.post("/process/{flow_id}", response_model=ProcessResponse)
async def process_flow(
    flow_id: str,
    inputs: Optional[dict] = None,
    tweaks: Optional[dict] = None,
    session: Session = Depends(get_session),
):
    """
    Endpoint to process an input with a given flow_id.
    """

    try:
        flow = session.get(Flow, flow_id)
        if flow is None:
            raise ValueError(f"Flow {flow_id} not found")

        if flow.data is None:
            raise ValueError(f"Flow {flow_id} has no data")
        graph_data = flow.data
        if tweaks:
            try:
                graph_data = process_tweaks(graph_data, tweaks)
            except Exception as exc:
                logger.error(f"Error processing tweaks: {exc}")
        response = process_graph_cached(graph_data, inputs)
        return ProcessResponse(
            result=response,
        )
    except Exception as e:
        # Log stack trace
        logger.exception(e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post(
    "/upload/{flow_id}",
    response_model=UploadFileResponse,
    status_code=HTTPStatus.CREATED,
)
async def create_upload_file(file: UploadFile, flow_id: str):
    # Cache file
    try:
        file_path = save_uploaded_file(file.file, folder_name=flow_id)

        return UploadFileResponse(
            flowId=flow_id,
            file_path=file_path,
        )
    except Exception as exc:
        logger.error(f"Error saving file: {exc}")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# get endpoint to return version of langflow
@router.get("/version")
def get_version():
    from langflow import __version__

    return {"version": __version__}


@router.post("/custom_component", status_code=HTTPStatus.OK)
async def custom_component(
    raw_code: CustomComponentCode,
):
    extractor = CustomComponent(code=raw_code.code)
    extractor.is_check_valid()

    return build_langchain_template_custom_component(extractor)
