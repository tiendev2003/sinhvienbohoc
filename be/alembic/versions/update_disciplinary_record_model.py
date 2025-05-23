"""update disciplinary record model with new fields

Revision ID: update_disciplinary_record
Revises: fix_enrollment_date
Create Date: 2025-05-23 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'update_disciplinary_record'
down_revision = 'fix_enrollment_date'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to disciplinary_records table
    op.add_column('disciplinary_records', sa.Column('consequences', sa.Text(), nullable=True))
    op.add_column('disciplinary_records', sa.Column('resolution_status', sa.Enum('open', 'pending', 'resolved'), nullable=False, server_default='open'))
    op.add_column('disciplinary_records', sa.Column('resolution_notes', sa.Text(), nullable=True))
    op.add_column('disciplinary_records', sa.Column('resolution_date', sa.Date(), nullable=True))
    op.add_column('disciplinary_records', sa.Column('created_by', sa.Integer(), nullable=True))
    op.add_column('disciplinary_records', sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True))
    op.add_column('disciplinary_records', sa.Column('updated_at', sa.TIMESTAMP(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=True))
    
    # Add foreign key constraint for created_by
    op.create_foreign_key('disciplinary_records_created_by_fk', 'disciplinary_records', 'users', ['created_by'], ['user_id'], ondelete='SET NULL')


def downgrade():
    # Remove foreign key constraint
    op.drop_constraint('disciplinary_records_created_by_fk', 'disciplinary_records', type_='foreignkey')
    
    # Remove added columns
    op.drop_column('disciplinary_records', 'updated_at')
    op.drop_column('disciplinary_records', 'created_at')
    op.drop_column('disciplinary_records', 'created_by')
    op.drop_column('disciplinary_records', 'resolution_date')
    op.drop_column('disciplinary_records', 'resolution_notes')
    op.drop_column('disciplinary_records', 'resolution_status')
    op.drop_column('disciplinary_records', 'consequences')
