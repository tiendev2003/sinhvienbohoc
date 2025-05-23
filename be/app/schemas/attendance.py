from typing import Optional, List
from datetime import date
from enum import Enum
from pydantic import BaseModel

# Attendance Status Enum
class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"

# Base Attendance Schema
class AttendanceBase(BaseModel):
    student_id: int
    class_id: int
    date: date
    status: AttendanceStatus = AttendanceStatus.PRESENT
    minutes_late: Optional[int] = 0
    notes: Optional[str] = None

# Schema for creating a new attendance record
class AttendanceCreate(AttendanceBase):
    pass

# Schema for updating an attendance record
class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    minutes_late: Optional[int] = None
    notes: Optional[str] = None

# Schema for returning attendance record from database
class AttendanceInDB(AttendanceBase):
    attendance_id: int
    created_at: date
    updated_at: date

    class Config:
        from_attributes = True

# Schema for API responses
class AttendanceResponse(BaseModel):
    attendance_id: int
    student_id: int
    class_id: int
    date: date
    status: AttendanceStatus = AttendanceStatus.PRESENT
    minutes_late: Optional[int] = 0
    notes: Optional[str] = None
    student_name: Optional[str] = None
    class_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Schema for attendance summary
class AttendanceSummary(BaseModel):
    student_id: int
    total_classes: int
    present_count: int
    absent_count: int
    late_count: int
    excused_count: int
    attendance_rate: float  # percentage

# Schema for bulk attendance creation
class BulkAttendanceCreate(BaseModel):
    class_id: int
    date: date
    records: List[dict]  # List of {student_id: int, status: str, minutes_late: Optional[int], notes: Optional[str]}

# Schema for attendance filter
class AttendanceFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[AttendanceStatus] = None
    class_id: Optional[int] = None
    student_id: Optional[int] = None
