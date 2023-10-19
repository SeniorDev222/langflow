from typing import List, Optional
from uuid import UUID
from langflow.services.auth import utils as auth_utils
from langflow.services.database.models.flow.flow import FlowCreate
from langflow.services.database.models.user.user import User
from langflow.services.deps import (
    get_store_service,
    get_settings_service,
)
from langflow.services.store.schema import ComponentResponse

from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime

from langflow.services.store.service import StoreService


router = APIRouter(prefix="/store", tags=["Components Store"])


def get_user_store_api_key(user: User = Depends(auth_utils.get_current_active_user)):
    if not user.store_api_key:
        raise HTTPException(
            status_code=400, detail="You must have a store API key set."
        )
    return user.store_api_key


@router.post("/", response_model=ComponentResponse)
def create_component(
    component: FlowCreate,
    store_service: StoreService = Depends(get_store_service),
    settings_service=Depends(get_settings_service),
    store_api_Key: str = Depends(get_user_store_api_key),
):
    try:
        decrypted = auth_utils.decrypt_api_key(store_api_Key, settings_service)
        return store_service.upload(decrypted, component.dict())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{component_id}", response_model=ComponentResponse)
def read_component(
    component_id: UUID,
    store_service: StoreService = Depends(get_store_service),
    store_api_Key: str = Depends(get_user_store_api_key),
    settings_service=Depends(get_settings_service),
):
    # If the component is from the store, we need to get it from the store
    try:
        decrypted = auth_utils.decrypt_api_key(store_api_Key, settings_service)
        component = store_service.get(decrypted, component_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if component is None:
        raise HTTPException(status_code=400, detail="Component not found")
    return component


@router.get("/", response_model=List[ComponentResponse])
def list_components(
    page: int = 1,
    limit: int = 10,
    store_service: StoreService = Depends(get_store_service),
    store_api_Key: str = Depends(get_user_store_api_key),
    settings_service=Depends(get_settings_service),
):
    try:
        decrypted = auth_utils.decrypt_api_key(store_api_Key, settings_service)
        return store_service.list_components(decrypted, page, limit)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/search", response_model=List[ComponentResponse])
async def search_endpoint(
    api_key: Optional[str] = Query(None),
    query: str = Query(...),
    page: int = Query(1),
    limit: int = Query(10),
    status: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    sort_by: Optional[str] = Query("likes"),
    sort: Optional[List[str]] = Query(None),
    fields: Optional[List[str]] = Query(None),
    store_service: "StoreService" = Depends(get_store_service),
):
    try:
        return await store_service.search(
            api_key=api_key,
            query=query,
            page=page,
            limit=limit,
            status=status,
            tags=tags,
            date_from=date_from,
            date_to=date_to,
            sort_by=sort_by,
            sort=sort,
            fields=fields,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        )
