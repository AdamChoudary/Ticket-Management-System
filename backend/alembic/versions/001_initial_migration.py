"""Initial migration - Create tickets table

Revision ID: 001
Revises: 
Create Date: 2026-02-02 18:42:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create tickets table with all required fields."""
    op.create_table(
        'tickets',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('request_content', sa.Text(), nullable=False),
        sa.Column(
            'status',
            sa.Enum('pending', 'processing', 'completed', 'failed', name='ticketstatus'),
            nullable=False,
            server_default='pending'
        ),
        sa.Column(
            'urgency',
            sa.Enum('High', 'Medium', 'Low', name='urgencylevel'),
            nullable=True
        ),
        sa.Column('sentiment_score', sa.Integer(), nullable=True),
        sa.Column(
            'category',
            sa.Enum('Billing', 'Technical', 'Feature', 'Other', name='ticketcategory'),
            nullable=True
        ),
        sa.Column('draft_response', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
    )
    
    # Create indexes for common queries
    op.create_index('ix_tickets_id', 'tickets', ['id'])
    op.create_index('ix_tickets_status', 'tickets', ['status'])
    op.create_index('ix_tickets_category', 'tickets', ['category'])
    op.create_index('ix_tickets_created_at', 'tickets', ['created_at'])


def downgrade() -> None:
    """Drop tickets table and associated enums."""
    op.drop_index('ix_tickets_created_at', table_name='tickets')
    op.drop_index('ix_tickets_category', table_name='tickets')
    op.drop_index('ix_tickets_status', table_name='tickets')
    op.drop_index('ix_tickets_id', table_name='tickets')
    op.drop_table('tickets')
    op.execute('DROP TYPE ticketcategory')
    op.execute('DROP TYPE urgencylevel')
    op.execute('DROP TYPE ticketstatus')
