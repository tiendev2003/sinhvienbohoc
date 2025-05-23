"""add_class_subject_table

Revision ID: add_class_subject_table
Revises: 917c61bc6fd2
Create Date: 2025-05-22 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_class_subject_table'
down_revision: Union[str, None] = '917c61bc6fd2'  # Ensure this matches your last migration
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create class_subjects table
    op.create_table('class_subjects',
        sa.Column('class_id', sa.Integer(), nullable=False),
        sa.Column('subject_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['class_id'], ['classes.class_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['subject_id'], ['subjects.subject_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('class_id', 'subject_id')
    )
    op.create_index(op.f('ix_class_subjects_class_id'), 'class_subjects', ['class_id'], unique=False)
    op.create_index(op.f('ix_class_subjects_subject_id'), 'class_subjects', ['subject_id'], unique=False)


def downgrade() -> None:
    # Remove class_subjects table
    op.drop_index(op.f('ix_class_subjects_subject_id'), table_name='class_subjects')
    op.drop_index(op.f('ix_class_subjects_class_id'), table_name='class_subjects')
    op.drop_table('class_subjects')
