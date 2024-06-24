"""Fix nullable

Revision ID: e3bc869fa272
Revises: 1a110b568907
Create Date: 2024-04-10 19:17:22.820455

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision: str = "e3bc869fa272"
down_revision: Union[str, None] = "1a110b568907"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)  # type: ignore
    table_names = inspector.get_table_names()
    # ### commands auto generated by Alembic - please adjust! ###
    if "variable" not in table_names:
        return
    columns = [column for column in inspector.get_columns("variable")]
    column_names = [column["name"] for column in columns]

    with op.batch_alter_table("variable", schema=None) as batch_op:
        if "created_at" in column_names:
            created_at_colunmn = next(column for column in columns if column["name"] == "created_at")
            if created_at_colunmn["nullable"] is False:
                batch_op.alter_column(
                    "created_at",
                    existing_type=sa.TIMESTAMP(timezone=True),
                    nullable=True,
                    # existing_server_default expects str | bool | Identity | Computed | None
                    # sa.text("now()") is not a valid value for existing_server_default
                    existing_server_default=False,
                )

    # ### end Alembic commands ###


def downgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)  # type: ignore
    table_names = inspector.get_table_names()
    # ### commands auto generated by Alembic - please adjust! ###
    if "variable" not in table_names:
        return
    columns = [column for column in inspector.get_columns("variable")]
    column_names = [column["name"] for column in columns]
    with op.batch_alter_table("variable", schema=None) as batch_op:
        if "created_at" in column_names:
            created_at_colunmn = next(column for column in columns if column["name"] == "created_at")
            if created_at_colunmn["nullable"] is True:
                batch_op.alter_column(
                    "created_at",
                    existing_type=sa.TIMESTAMP(timezone=True),
                    nullable=False,
                    existing_server_default=False,
                )

    # ### end Alembic commands ###
