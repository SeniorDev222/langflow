import asyncio
from typing import Dict, List
from collections import defaultdict
from fastapi import WebSocket
import json
from langflow.api.schemas import ChatMessage, ChatResponse, FileResponse
from langflow.cache.manager import Subject
from langflow.interface.run import (
    get_result_and_steps,
    load_or_build_langchain_object,
)
from langflow.interface.utils import pil_to_base64, try_setting_streaming_options
from langflow.utils.logger import logger
from langflow.cache import cache_manager


class ChatHistory(Subject):
    def __init__(self):
        super().__init__()
        self.history: Dict[str, List[ChatMessage]] = defaultdict(list)

    def add_message(self, client_id: str, message: ChatMessage):
        """Add a message to the chat history."""

        self.history[client_id].append(message)
        if not isinstance(message, FileResponse):
            self.notify()

    def get_history(self, client_id: str, filter=True) -> List[ChatMessage]:
        """Get the chat history for a client."""
        if history := self.history.get(client_id, []):
            if filter:
                return [msg for msg in history if msg.type not in ["start", "stream"]]
            return history
        else:
            return []


class ChatManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.chat_history = ChatHistory()
        self.chat_history.attach(self.on_chat_history_update)
        self.cache_manager = cache_manager
        self.cache_manager.attach(self.update)

    def on_chat_history_update(self):
        """Send the last chat message to the client."""
        client_id = self.cache_manager.current_client_id
        if client_id in self.active_connections:
            chat_response = self.chat_history.get_history(client_id, filter=False)[-1]
            if chat_response.is_bot:
                # Process FileResponse
                if isinstance(chat_response, FileResponse):
                    # If data_type is pandas, convert to csv
                    if chat_response.data_type == "pandas":
                        chat_response.data = chat_response.data.to_csv()
                    elif chat_response.data_type == "image":
                        # Base64 encode the image
                        chat_response.data = pil_to_base64(chat_response.data)
                # get event loop
                loop = asyncio.get_event_loop()

                coroutine = self.send_json(client_id, chat_response)
                asyncio.run_coroutine_threadsafe(coroutine, loop)

    def update(self):
        if self.cache_manager.current_client_id in self.active_connections:
            self.last_cached_object_dict = self.cache_manager.get_last()
            # Add a new ChatResponse with the data
            chat_response = FileResponse(
                message=None,
                type="file",
                data=self.last_cached_object_dict["obj"],
                data_type=self.last_cached_object_dict["type"],
            )

            self.chat_history.add_message(
                self.cache_manager.current_client_id, chat_response
            )

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        del self.active_connections[client_id]

    async def send_message(self, client_id: str, message: str):
        websocket = self.active_connections[client_id]
        await websocket.send_text(message)

    async def send_json(self, client_id: str, message: ChatMessage):
        websocket = self.active_connections[client_id]
        await websocket.send_json(message.dict())

    async def process_message(self, client_id: str, payload: Dict):
        # Process the graph data and chat message
        chat_message = payload.pop("message", "")
        chat_message = ChatMessage(message=chat_message)
        self.chat_history.add_message(client_id, chat_message)

        graph_data = payload
        start_resp = ChatResponse(message=None, type="start", intermediate_steps="")
        self.chat_history.add_message(client_id, start_resp)

        is_first_message = len(self.chat_history.get_history(client_id=client_id)) == 0
        # Generate result and thought
        try:
            logger.debug("Generating result and thought")

            result, intermediate_steps = await process_graph(
                graph_data=graph_data,
                is_first_message=is_first_message,
                chat_message=chat_message,
                websocket=self.active_connections[client_id],
            )
        except Exception as e:
            # Log stack trace
            logger.exception(e)
            raise e
        # Send a response back to the frontend, if needed
        intermediate_steps = intermediate_steps or ""
        history = self.chat_history.get_history(client_id, filter=False)
        file_responses = []
        if history:
            for msg in history:
                if isinstance(msg, FileResponse):
                    file_responses.append(msg)
                if msg.type == "start":
                    break

        response = ChatResponse(
            message=result or "",
            intermediate_steps=intermediate_steps.strip(),
            type="end",
            files=file_responses,
        )
        self.chat_history.add_message(client_id, response)

    async def handle_websocket(self, client_id: str, websocket: WebSocket):
        await self.connect(client_id, websocket)

        try:
            chat_history = self.chat_history.get_history(client_id)
            # iterate and make BaseModel into dict
            chat_history = [chat.dict() for chat in chat_history]
            await websocket.send_json(chat_history)

            while True:
                json_payload = await websocket.receive_json()
                try:
                    payload = json.loads(json_payload)
                except TypeError:
                    payload = json_payload
                if "clear_history" in payload:
                    self.chat_history.history[client_id] = []
                    continue

                with self.cache_manager.set_client_id(client_id):
                    await self.process_message(client_id, payload)
        except Exception as e:
            # Handle any exceptions that might occur
            print(f"Error: {e}")
            raise e
        finally:
            self.disconnect(client_id)


async def process_graph(
    graph_data: Dict,
    is_first_message: bool,
    chat_message: ChatMessage,
    websocket: WebSocket,
):
    langchain_object = load_or_build_langchain_object(graph_data, is_first_message)
    langchain_object = try_setting_streaming_options(langchain_object, websocket)
    logger.debug("Loaded langchain object")

    if langchain_object is None:
        # Raise user facing error
        raise ValueError(
            "There was an error loading the langchain_object. Please, check all the nodes and try again."
        )

    # Generate result and thought
    try:
        logger.debug("Generating result and thought")
        result, intermediate_steps = get_result_and_steps(
            langchain_object, chat_message.message or ""
        )
        logger.debug("Generated result and intermediate_steps")
        return result, intermediate_steps
    except Exception as e:
        # Log stack trace
        logger.exception(e)
        raise e
