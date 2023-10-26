from typing import List, Optional
from uuid import UUID
from langflow.services.auth import utils as auth_utils
from langflow.services.database.models.user.user import User
from langflow.services.deps import (
    get_store_service,
    get_settings_service,
)
from langflow.services.store.schema import (
    ComponentResponse,
    DownloadComponentResponse,
    ListComponentResponse,
    StoreComponentCreate,
)

from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime

from langflow.services.store.service import StoreService


router = APIRouter(prefix="/store", tags=["Components Store"])


def get_user_store_api_key(
    user: User = Depends(auth_utils.get_current_active_user),
    settings_service=Depends(get_settings_service),
):
    if not user.store_api_key:
        raise HTTPException(
            status_code=400, detail="You must have a store API key set."
        )
    decrypted = auth_utils.decrypt_api_key(user.store_api_key, settings_service)
    return decrypted


def get_optional_user_store_api_key(
    user: User = Depends(auth_utils.get_current_active_user),
    settings_service=Depends(get_settings_service),
):
    if not user.store_api_key:
        return None
    decrypted = auth_utils.decrypt_api_key(user.store_api_key, settings_service)
    return decrypted


@router.post("/components/", response_model=ComponentResponse, status_code=201)
def create_component(
    component: StoreComponentCreate,
    store_service: StoreService = Depends(get_store_service),
    store_api_Key: str = Depends(get_user_store_api_key),
):
    try:
        return store_service.upload(store_api_Key, component)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/components/", response_model=List[ListComponentResponse])
def list_components(
    filter_by_user: bool = Query(False),
    page: int = 1,
    limit: int = 10,
    store_service: StoreService = Depends(get_store_service),
    store_api_Key: str = Depends(get_optional_user_store_api_key),
):
    try:
        fields = ["id", "name", "description", "user_created.name", "is_component"]
        result = store_service.query_components(
            store_api_Key,
            page,
            limit,
            fields=fields,
            filter_by_user=filter_by_user,
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/components/count", response_model=dict)
def count_components(
    filter_by_user: bool = Query(False),
    store_service: StoreService = Depends(get_store_service),
    store_api_Key: str = Depends(get_optional_user_store_api_key),
):
    try:
        result = store_service.query_components(
            store_api_Key,
            count=True,
            filter_by_user=filter_by_user,
        )
        return {"count": result[0].get("count", 0)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/components/{component_id}", response_model=DownloadComponentResponse)
def read_component(
    component_id: UUID,
    store_service: StoreService = Depends(get_store_service),
    store_api_Key: str = Depends(get_user_store_api_key),
):
    # If the component is from the store, we need to get it from the store

    try:
        component = store_service.download(store_api_Key, component_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if component is None:
        raise HTTPException(status_code=400, detail="Component not found")

    return component


@router.get("/search", response_model=List[ComponentResponse])
async def search_endpoint(
    query: str = Query(...),
    page: int = Query(1),
    limit: int = Query(10),
    status: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    sort: Optional[List[str]] = Query(None),
    filter_by_user: bool = Query(False),
    fields: Optional[List[str]] = Query(None),
    store_service: "StoreService" = Depends(get_store_service),
    store_api_Key: str = Depends(get_optional_user_store_api_key),
):
    try:
        return store_service.search(
            api_key=store_api_Key,
            query=query,
            page=page,
            limit=limit,
            status=status,
            tags=tags,
            date_from=date_from,
            date_to=date_to,
            sort=sort,
            fields=fields,
            filter_by_user=filter_by_user,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
