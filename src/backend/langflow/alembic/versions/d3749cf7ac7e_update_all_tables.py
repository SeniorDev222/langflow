"""Update all tables

Revision ID: d3749cf7ac7e
Revises: 5512e39b4012
Create Date: 2023-08-25 15:16:00.970071

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'd3749cf7ac7e'
down_revision: Union[str, None] = '5512e39b4012'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('apikey', sa.Column('created_at', sa.DateTime(), nullable=False))
    op.add_column('apikey', sa.Column('user_id', sqlmodel.sql.sqltypes.GUID(), nullable=False))
    op.alter_column('apikey', 'name',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.create_index(op.f('ix_apikey_name'), 'apikey', ['name'], unique=False)
    op.create_index(op.f('ix_apikey_user_id'), 'apikey', ['user_id'], unique=False)
    op.create_foreign_key(None, 'apikey', 'user', ['user_id'], ['id'])
    op.drop_column('apikey', 'create_at')
    op.add_column('flow', sa.Column('user_id', sqlmodel.sql.sqltypes.GUID(), nullable=False))
    op.create_index(op.f('ix_flow_user_id'), 'flow', ['user_id'], unique=False)
    op.create_foreign_key(None, 'flow', 'user', ['user_id'], ['id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'flow', type_='foreignkey')
    op.drop_index(op.f('ix_flow_user_id'), table_name='flow')
    op.drop_column('flow', 'user_id')
    op.add_column('apikey', sa.Column('create_at', sa.DATETIME(), nullable=False))
    op.drop_constraint(None, 'apikey', type_='foreignkey')
    op.drop_index(op.f('ix_apikey_user_id'), table_name='apikey')
    op.drop_index(op.f('ix_apikey_name'), table_name='apikey')
    op.alter_column('apikey', 'name',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.drop_column('apikey', 'user_id')
    op.drop_column('apikey', 'created_at')
    # ### end Alembic commands ###
