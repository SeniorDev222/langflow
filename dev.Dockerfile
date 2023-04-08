FROM python:3.10-slim

WORKDIR /app

# Install Poetry
RUN apt-get update && apt-get install gcc g++ curl -y
RUN curl -sSL https://install.python-poetry.org | python3 -
# # Add Poetry to PATH
ENV PATH="${PATH}:/root/.local/bin"
# # Copy the pyproject.toml and poetry.lock files
COPY poetry.lock pyproject.toml ./
# Copy the rest of the application codes
COPY ./ ./

# Install dependencies
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

# Set the logging level to DEBUG
ENV LOG_LEVEL=debug

CMD ["uvicorn", "langflow.main:app", "--host", "0.0.0.0", "--port", "5003", "--reload", "log-level", "debug"]