"""Adds tables

Revision ID: 260dbcc8b680
Revises:
Create Date: 2023-08-27 19:49:02.681355

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision: str = "260dbcc8b680"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###

    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    # List existing tables
    existing_tables = inspector.get_table_names()
    existing_indices_flow = []
    if "flow" in existing_tables:
        existing_indices_flow = [
            index["name"] for index in inspector.get_indexes("flow")
        ]
    # Existing foreign keys for the 'flow' table, if it exists
    existing_fks_flow = []
    if "flow" in existing_tables:
        existing_fks_flow = [
            fk["referred_table"] + "." + fk["referred_columns"][0]
            for fk in inspector.get_foreign_keys("flow")
        ]

    op.create_table(
        "user",
        sa.Column("id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column("username", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("password", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_superuser", sa.Boolean(), nullable=False),
        sa.Column("create_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("id"),
    )
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_user_username"), ["username"], unique=True)

    op.create_table(
        "apikey",
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("last_used_at", sa.DateTime(), nullable=True),
        sa.Column("total_uses", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column("api_key", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("user_id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("id"),
    )
    with op.batch_alter_table("apikey", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_apikey_api_key"), ["api_key"], unique=True)
        batch_op.create_index(batch_op.f("ix_apikey_name"), ["name"], unique=False)
        batch_op.create_index(
            batch_op.f("ix_apikey_user_id"), ["user_id"], unique=False
        )
    if "flow" not in existing_tables:
        op.create_table(
            "flow",
            sa.Column("data", sa.JSON(), nullable=True),
            sa.Column("name", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
            sa.Column("description", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
            sa.Column("id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
            sa.Column("user_id", sqlmodel.sql.sqltypes.GUID(), nullable=False),
            sa.ForeignKeyConstraint(
                ["user_id"],
                ["user.id"],
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("id"),
        )
    elif "user.id" not in existing_fks_flow:
        with op.batch_alter_table("flow") as batch_op:
            batch_op.create_foreign_key("fk_flow_user_id", "user", ["user_id"], ["id"])
    # Conditionally create indices for 'flow' table
    with op.batch_alter_table("flow", schema=None) as batch_op:
        if "ix_flow_description" not in existing_indices_flow:
            batch_op.create_index(
                batch_op.f("ix_flow_description"), ["description"], unique=False
            )
        if "ix_flow_name" not in existing_indices_flow:
            batch_op.create_index(batch_op.f("ix_flow_name"), ["name"], unique=False)
        if "ix_flow_user_id" not in existing_indices_flow:
            batch_op.create_index(
                batch_op.f("ix_flow_user_id"), ["user_id"], unique=False
            )

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###

    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    # List existing tables
    existing_tables = inspector.get_table_names()
    if "flow" in existing_tables:
        with op.batch_alter_table("flow", schema=None) as batch_op:
            batch_op.drop_index(batch_op.f("ix_flow_user_id"))
            batch_op.drop_index(batch_op.f("ix_flow_name"))
            batch_op.drop_index(batch_op.f("ix_flow_description"))

        op.drop_table("flow")
    if "apikey" in existing_tables:
        with op.batch_alter_table("apikey", schema=None) as batch_op:
            batch_op.drop_index(batch_op.f("ix_apikey_user_id"))
            batch_op.drop_index(batch_op.f("ix_apikey_name"))
            batch_op.drop_index(batch_op.f("ix_apikey_api_key"))

        op.drop_table("apikey")
    if "user" in existing_tables:
        with op.batch_alter_table("user", schema=None) as batch_op:
            batch_op.drop_index(batch_op.f("ix_user_username"))

        op.drop_table("user")
    # ### end Alembic commands ###
