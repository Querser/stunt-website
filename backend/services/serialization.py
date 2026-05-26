from pydantic import BaseModel


def dump_schema(schema: type[BaseModel], item):
    return schema.model_validate(item).model_dump(mode="json")


def dump_schema_many(schema: type[BaseModel], items):
    return [dump_schema(schema, item) for item in items]
