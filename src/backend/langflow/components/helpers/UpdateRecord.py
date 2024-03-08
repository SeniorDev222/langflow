from langflow import CustomComponent
from langflow.schema import Record


class UpdateRecordComponent(CustomComponent):
    display_name = "Update Record"
    description = "Updates a record with new data."

    def build_config(self):
        return {
            "record": {
                "display_name": "Record",
                "info": "The record to update.",
            },
            "new_data": {
                "display_name": "New Data",
                "info": "The new data to update the record with.",
            },
        }

    def build(
        self,
        record: Record,
        new_data: dict,
    ) -> Record:
        """
        Updates a record with new data.

        Args:
            record (Record): The record to update.
            new_data (dict): The new data to update the record with.

        Returns:
            Record: The updated record.
        """
        record.data.update(new_data)
        self.status = record
        return record
