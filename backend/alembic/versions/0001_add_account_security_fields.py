"""Add account security fields for lockout and rate limiting

Revision ID: add_account_security
Revises: 0c0d570bd30a
Create Date: 2026-03-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_account_security'
down_revision: Union[str, Sequence[str], None] = '0c0d570bd30a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - add account security columns to users table."""
    op.add_column('users', sa.Column('failed_login_attempts', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('users', sa.Column('account_locked', sa.Boolean(), nullable=True, server_default='0'))
    op.add_column('users', sa.Column('account_locked_until', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('last_login', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('last_login_ip', sa.String(length=45), nullable=True))


def downgrade() -> None:
    """Downgrade schema - remove account security columns from users table."""
    op.drop_column('users', 'last_login_ip')
    op.drop_column('users', 'last_login')
    op.drop_column('users', 'account_locked_until')
    op.drop_column('users', 'account_locked')
    op.drop_column('users', 'failed_login_attempts')
