from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import BikeType
from schemas import AccessoryOut, BikeOut, GraphicOptionOut, PartOut
from services.catalog import CatalogService
from services.exceptions import NotFoundError


router = APIRouter()


def get_catalog_service(db: AsyncSession = Depends(get_db)) -> CatalogService:
    return CatalogService(db)


def _set_cache_header(response: Response, cache_status: str) -> None:
    response.headers["X-Cache"] = cache_status


@router.get("/bikes", response_model=List[BikeOut], tags=["Bikes"])
async def get_bikes(
    response: Response,
    bike_type: Optional[BikeType] = None,
    has_pts: Optional[bool] = None,
    local_only: bool = False,
    configurable_only: bool = False,
    service: CatalogService = Depends(get_catalog_service),
):
    payload, cache_status = await service.list_bikes(
        bike_type=bike_type,
        has_pts=has_pts,
        local_only=local_only,
        configurable_only=configurable_only,
    )
    _set_cache_header(response, cache_status)
    return payload


@router.get("/bikes/{bike_id}", response_model=BikeOut, tags=["Bikes"])
async def get_bike_by_id(
    bike_id: int,
    response: Response,
    service: CatalogService = Depends(get_catalog_service),
):
    try:
        payload, cache_status = await service.get_bike(bike_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=exc.detail)

    _set_cache_header(response, cache_status)
    return payload


@router.get("/graphics/{frame_type_id}", response_model=List[GraphicOptionOut], tags=["Configurator"])
async def get_graphics(
    frame_type_id: int,
    response: Response,
    service: CatalogService = Depends(get_catalog_service),
):
    payload, cache_status = await service.list_graphics(frame_type_id)
    _set_cache_header(response, cache_status)
    return payload


@router.get("/accessories", response_model=List[AccessoryOut], tags=["Configurator"])
async def get_accessories(
    response: Response,
    service: CatalogService = Depends(get_catalog_service),
):
    payload, cache_status = await service.list_accessories()
    _set_cache_header(response, cache_status)
    return payload


@router.get("/parts", response_model=List[PartOut], tags=["Parts"])
async def get_parts(
    response: Response,
    service: CatalogService = Depends(get_catalog_service),
):
    payload, cache_status = await service.list_parts()
    _set_cache_header(response, cache_status)
    return payload
