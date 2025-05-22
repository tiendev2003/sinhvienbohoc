from typing import List, Optional, Dict, Any, Tuple, Type, TypeVar, Generic, Union
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from pydantic import BaseModel
from fastapi import HTTPException, status
from app.schemas.schemas import PaginationParams, SearchParams

# Define a generic type for SQLAlchemy models
ModelType = TypeVar("ModelType")
# Define a generic type for Pydantic schemas
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Base class for CRUD operations with pagination and search
    """
    def __init__(self, model: Type[ModelType]):
        """
        Initialization with SQLAlchemy model
        
        Args:
            model: The SQLAlchemy model class
        """
        self.model = model
    
    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """
        Get a single record by ID
        """
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        """
        Get multiple records with optional filters
        """
        query = db.query(self.model)
        
        # Apply filters if provided
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    if isinstance(value, list):
                        query = query.filter(getattr(self.model, field).in_(value))
                    else:
                        query = query.filter(getattr(self.model, field) == value)
                        
        return query.offset(skip).limit(limit).all()
    
    def get_paginated(
        self,
        db: Session,
        pagination: PaginationParams,
        search: Optional[SearchParams] = None,
        filters: Optional[Dict[str, Any]] = None,
        search_fields: Optional[List[str]] = None
    ) -> Tuple[List[ModelType], int]:
        """
        Get paginated list of records with search and filter capabilities
        
        Args:
            db: Database session
            pagination: Pagination parameters
            search: Search parameters
            filters: Dictionary of filters to apply
            search_fields: List of fields to search in (if not specified, will use a default set)
            
        Returns:
            Tuple containing list of records and total count
        """
        query = db.query(self.model)
        
        # Apply search if provided
        if search and search.query:
            search_term = f"%{search.query}%"
            if search.field:
                # Search in specific field
                if hasattr(self.model, search.field):
                    query = query.filter(getattr(self.model, search.field).ilike(search_term))
            elif search_fields:
                # Search in provided fields
                search_conditions = []
                for field in search_fields:
                    if hasattr(self.model, field):
                        search_conditions.append(getattr(self.model, field).ilike(search_term))
                if search_conditions:
                    query = query.filter(or_(*search_conditions))
        
        # Apply filters if provided
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    if isinstance(value, list):
                        query = query.filter(getattr(self.model, field).in_(value))
                    else:
                        query = query.filter(getattr(self.model, field) == value)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (pagination.page - 1) * pagination.size
        query = query.offset(offset).limit(pagination.size)
        
        # Execute query
        items = query.all()
        
        return items, total
    
    def create(self, db: Session, obj_in: CreateSchemaType) -> ModelType:
        """
        Create a new record
        """
        obj_in_data = obj_in.dict()
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self, 
        db: Session, 
        db_obj: ModelType, 
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """
        Update a record
        """
        obj_data = db_obj.__dict__
        
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
            
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, id: Any) -> ModelType:
        """
        Remove a record
        """
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
