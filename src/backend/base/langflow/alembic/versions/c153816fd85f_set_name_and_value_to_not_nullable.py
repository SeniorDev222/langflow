"""Set name and value to not nullable

Revision ID: c153816fd85f
Revises: 1f4d6df60295
Create Date: 2024-04-30 14:31:23.898995

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision: str = "c153816fd85f"
down_revision: Union[str, None] = "1f4d6df60295"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)  # type: ignore
    # ### commands auto generated by Alembic - please adjust! ###
    columns = inspector.get_columns("variable")
    with op.batch_alter_table("variable", schema=None) as batch_op:
        name_column = [column for column in columns if column["name"] == "name"][0]
        if name_column and name_column["nullable"]:
            batch_op.alter_column("name", existing_type=sa.VARCHAR(), nullable=False)
        value_column = [column for column in columns if column["name"] == "value"][0]
        if value_column and value_column["nullable"]:
            batch_op.alter_column("value", existing_type=sa.VARCHAR(), nullable=False)


# ### end Alembic commands ###


def downgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)  # type: ignore
    columns = inspector.get_columns("variable")
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("variable", schema=None) as batch_op:
        name_column = [column for column in columns if column["name"] == "name"][0]
        if name_column and not name_column["nullable"]:
            batch_op.alter_column("name", existing_type=sa.VARCHAR(), nullable=True)
        value_column = [column for column in columns if column["name"] == "value"][0]
        if value_column and not value_column["nullable"]:
            batch_op.alter_column("name", existing_type=sa.VARCHAR(), nullable=True)

    # ### end Alembic commands ###
