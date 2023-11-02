from typing import TYPE_CHECKING
from langflow.services.plugins.service import PluginService
from langflow.services.factory import ServiceFactory

if TYPE_CHECKING:
    from langflow.services.settings.service import SettingsService


class PluginServiceFactory(ServiceFactory):
    def __init__(self):
        super().__init__(PluginService)

    def create(self, settings_service: "SettingsService"):
        service = PluginService(settings_service)
        service.load_plugins()
        return service
