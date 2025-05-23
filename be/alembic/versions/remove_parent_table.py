"""remove parent table

Revision ID: remove_parent_table
Revises: add_class_subject_table
Create Date: 2024-05-23 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'remove_parent_table'
down_revision = 'add_class_subject_table'
branch_labels = None
depends_on = None


def upgrade():
    # Drop foreign key constraints first
    op.drop_constraint('parents_user_id_fkey', 'parents', type_='foreignkey')
    op.drop_constraint('parents_student_id_fkey', 'parents', type_='foreignkey')
    
    # Drop the parents table
    op.drop_table('parents')


def downgrade():
    # Create parents table
    op.create_table('parents',
        sa.Column('parent_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('student_id', sa.Integer(), nullable=True),
        sa.Column('relation_to_student', sa.Enum('father', 'mother', 'guardian', 'other', name='parent_relation_enum'), nullable=False),
        sa.Column('occupation', sa.String(length=100), nullable=True),
        sa.Column('education_level', sa.Enum('primary', 'secondary', 'high_school', 'college', 'university', 'post_graduate', 'none', name='education_level_enum'), nullable=True),
        sa.Column('income', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('phone_secondary', sa.String(length=20), nullable=True),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['student_id'], ['students.student_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('parent_id'),
        sa.UniqueConstraint('user_id')
    )
