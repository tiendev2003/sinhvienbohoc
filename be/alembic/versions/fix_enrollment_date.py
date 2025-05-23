"""fix_enrollment_date_default

Revision ID: fix_enrollment_date
Revises: remove_parent_table
Create Date: 2023-05-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'fix_enrollment_date'
down_revision = 'remove_parent_table'
branch_labels = None
depends_on = None


def upgrade():
    # First drop the table if it exists
    op.execute("""
    DROP TABLE IF EXISTS class_students
    """)
    
    # Recreate the table with proper defaults
    op.execute("""
    CREATE TABLE class_students (
        class_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        enrollment_date DATE DEFAULT (CURRENT_DATE),
        status ENUM('enrolled','dropped','completed') DEFAULT 'enrolled',
        PRIMARY KEY (class_id, student_id),
        FOREIGN KEY(class_id) REFERENCES classes (class_id) ON DELETE CASCADE,
        FOREIGN KEY(student_id) REFERENCES students (student_id) ON DELETE CASCADE
    )
    """)


def downgrade():
    op.execute("""
    DROP TABLE IF EXISTS class_students
    """)
    
    op.execute("""
    CREATE TABLE class_students (
        class_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,
        enrollment_date DATE,
        status ENUM('enrolled','dropped','completed') DEFAULT 'enrolled',
        PRIMARY KEY (class_id, student_id),
        FOREIGN KEY(class_id) REFERENCES classes (class_id) ON DELETE CASCADE,
        FOREIGN KEY(student_id) REFERENCES students (student_id) ON DELETE CASCADE
    )
    """)
