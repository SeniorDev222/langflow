from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID


class TagResponse(BaseModel):
    id: UUID
    name: Optional[str]


class UsersLikesResponse(BaseModel):
    id: UUID
    likes: Optional[List[UUID]]


class ComponentResponse(BaseModel):
    id: UUID
    status: Optional[str]
    sort: Optional[int]
    user_name: Optional[str]
    date_created: Optional[datetime]
    user_updated: Optional[UUID]
    date_updated: Optional[datetime]
    is_component: Optional[bool]
    name: Optional[str]
    description: Optional[str]
    data: Optional[dict]
    tags: Optional[List[int]]
    liked_by_count: Optional[int]
    parent: Optional[UUID]
    metadata: Optional[dict]


class ListComponentResponse(BaseModel):
    id: UUID
    name: Optional[str]
    description: Optional[str]
    liked_by_count: Optional[int]
    is_component: Optional[bool]
    metadata: Optional[dict]


class DownloadComponentResponse(BaseModel):
    id: UUID
    name: Optional[str]
    description: Optional[str]
    data: Optional[dict]
    is_component: Optional[bool]
    metadata: Optional[dict]


class StoreComponentCreate(BaseModel):
    name: str
    description: Optional[str]
    data: dict
    tags: Optional[List[str]]
    parent: Optional[UUID]
    is_component: Optional[bool]
    metadata: Optional[dict]
