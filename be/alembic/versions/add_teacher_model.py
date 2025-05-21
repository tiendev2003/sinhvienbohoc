"""add_teacher_model

Revision ID: e54321abcdef
Revises: 917c61bc6fd2
Create Date: 2025-05-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e54321abcdef'
down_revision = '917c61bc6fd2'
branch_labels = None
depends_on = None


def upgrade():
    # Create teachers table
    op.create_table('teachers',
        sa.Column('teacher_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('teacher_code', sa.String(20), nullable=False),
        sa.Column('department', sa.String(100), nullable=True),
        sa.Column('position', sa.String(100), nullable=True),
        sa.Column('specialization', sa.String(255), nullable=True),
        sa.Column('qualifications', sa.Text(), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.Enum('male', 'female', 'other'), nullable=True),
        sa.Column('years_of_experience', sa.Integer(), nullable=True),
        sa.Column('date_hired', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('teacher_id'),
        sa.UniqueConstraint('teacher_code'),
        sa.UniqueConstraint('user_id')
    )
    
    # Modify classes table to reference teacher_id from teachers table
    op.drop_constraint('classes_ibfk_1', 'classes', type_='foreignkey')
    op.alter_column('classes', 'teacher_id', existing_type=sa.Integer(), nullable=True)
    op.create_foreign_key('classes_teachers_fk', 'classes', 'teachers', ['teacher_id'], ['teacher_id'], ondelete='SET NULL')


def downgrade():
    # Restore original classes table foreign key
    op.drop_constraint('classes_teachers_fk', 'classes', type_='foreignkey')
    op.create_foreign_key('classes_ibfk_1', 'classes', 'users', ['teacher_id'], ['user_id'], ondelete='SET NULL')
    
    # Drop teachers table
    op.drop_table('teachers')
