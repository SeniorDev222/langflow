import os

import yaml
from pydantic import BaseSettings, root_validator


class Settings(BaseSettings):
    chains: dict = {}
    agents: dict = {}
    prompts: dict = {}
    llms: dict = {}
    tools: dict = {}
    memories: dict = {}
    embeddings: dict = {}
    vectorstores: dict = {}
    documentloaders: dict = {}
    wrappers: dict = {}
    toolkits: dict = {}
    textsplitters: dict = {}
    utilities: dict = {}
    dev: bool = False
    database_url: str = "sqlite:///./langflow.db"
    remove_api_keys: bool = False

    class Config:
        validate_assignment = True
        extra = "ignore"
        env_prefix = "LANGFLOW_"

    @root_validator(allow_reuse=True)
    def validate_lists(cls, values):
        for key, value in values.items():
            if key != "dev" and not value:
                values[key] = []
        return values

    def update_from_yaml(self, file_path: str, dev: bool = False):
        new_settings = load_settings_from_yaml(file_path)
        self.chains = new_settings.chains or []
        self.agents = new_settings.agents or []
        self.prompts = new_settings.prompts or []
        self.llms = new_settings.llms or []
        self.tools = new_settings.tools or []
        self.memories = new_settings.memories or []
        self.wrappers = new_settings.wrappers or []
        self.toolkits = new_settings.toolkits or []
        self.textsplitters = new_settings.textsplitters or []
        self.utilities = new_settings.utilities or []
        self.dev = dev

    def update_settings(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)


def save_settings_to_yaml(settings: Settings, file_path: str):
    with open(file_path, "w") as f:
        settings_dict = settings.dict()
        yaml.dump(settings_dict, f)


def load_settings_from_yaml(file_path: str) -> Settings:
    # Check if a string is a valid path or a file name
    if "/" not in file_path:
        # Get current path
        current_path = os.path.dirname(os.path.abspath(__file__))

        file_path = os.path.join(current_path, file_path)

    with open(file_path, "r") as f:
        settings_dict = yaml.safe_load(f)

    return Settings(**settings_dict)


settings = load_settings_from_yaml("config.yaml")
