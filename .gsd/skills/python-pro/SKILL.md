# Python Pro Skill

**When to use:** Python development, backend scripts, data processing, automation, API development

---

## Overview

Expert Python patterns for clean, performant, production-ready code. Covers modern Python (3.10+), type hints, async/await, testing, and best practices.

---

## Modern Python Patterns

### Type Hints (Python 3.10+)
```python
from typing import Optional, Union
from collections.abc import Sequence

# Use built-in types for generics (3.9+)
def process_items(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}

# Optional and Union
def get_user(user_id: int) -> Optional[dict]:
    return None

# New union syntax (3.10+)
def parse_value(val: int | str | None) -> str:
    return str(val) if val else ""

# Sequence for read-only list-like
def sum_numbers(nums: Sequence[int]) -> int:
    return sum(nums)
```

---

### Dataclasses vs Pydantic

**Use dataclasses for internal models:**
```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class User:
    id: int
    name: str
    email: str
    created_at: datetime = field(default_factory=datetime.now)
    tags: list[str] = field(default_factory=list)
    
    def __post_init__(self):
        # Validation after init
        if not self.email:
            raise ValueError("Email required")
```

**Use Pydantic for API/external data:**
```python
from pydantic import BaseModel, EmailStr, Field, validator

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(..., ge=0, le=150)
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.title()
    
    class Config:
        # Enable ORM mode for SQLAlchemy models
        from_attributes = True
```

---

### Async/Await

**Async functions:**
```python
import asyncio
import httpx
from typing import Any

async def fetch_user(user_id: int) -> dict[str, Any]:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"/users/{user_id}")
        return response.json()

# Gather multiple async calls
async def fetch_multiple_users(user_ids: list[int]) -> list[dict]:
    tasks = [fetch_user(uid) for uid in user_ids]
    return await asyncio.gather(*tasks)

# Run async code
if __name__ == "__main__":
    asyncio.run(fetch_multiple_users([1, 2, 3]))
```

**Async context managers:**
```python
from contextlib import asynccontextmanager
from typing import AsyncIterator

@asynccontextmanager
async def db_connection() -> AsyncIterator[Connection]:
    conn = await create_connection()
    try:
        yield conn
    finally:
        await conn.close()

# Usage
async with db_connection() as conn:
    await conn.execute("SELECT * FROM users")
```

---

### Error Handling

**Custom exceptions:**
```python
class AppError(Exception):
    """Base exception for app-specific errors"""
    pass

class UserNotFoundError(AppError):
    def __init__(self, user_id: int):
        self.user_id = user_id
        super().__init__(f"User {user_id} not found")

class ValidationError(AppError):
    def __init__(self, field: str, message: str):
        self.field = field
        super().__init__(f"{field}: {message}")
```

**Error handling patterns:**
```python
from typing import TypeVar, Generic
from dataclasses import dataclass

T = TypeVar('T')

@dataclass
class Result(Generic[T]):
    value: T | None = None
    error: Exception | None = None
    
    @property
    def is_ok(self) -> bool:
        return self.error is None
    
    @property
    def is_err(self) -> bool:
        return self.error is not None

def safe_divide(a: int, b: int) -> Result[float]:
    try:
        return Result(value=a / b)
    except ZeroDivisionError as e:
        return Result(error=e)

# Usage
result = safe_divide(10, 0)
if result.is_ok:
    print(f"Result: {result.value}")
else:
    print(f"Error: {result.error}")
```

---

## FastAPI Patterns

### Modern API structure:
```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Annotated

app = FastAPI()

# Dependency injection
async def get_db():
    db = Database()
    try:
        yield db
    finally:
        await db.close()

DbDep = Annotated[Database, Depends(get_db)]

# Response models
class UserResponse(BaseModel):
    id: int
    name: str
    email: str

# Route with dependency
@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: DbDep,
) -> UserResponse:
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

# Background tasks
from fastapi import BackgroundTasks

async def send_email(email: str, message: str):
    # Send email logic
    pass

@app.post("/users/")
async def create_user(
    user: UserCreate,
    background_tasks: BackgroundTasks,
):
    # Create user
    new_user = await db.create_user(user)
    
    # Send welcome email in background
    background_tasks.add_task(send_email, user.email, "Welcome!")
    
    return new_user
```

---

## Testing

### Pytest patterns:
```python
import pytest
from unittest.mock import Mock, patch, AsyncMock

# Fixtures
@pytest.fixture
def user_data():
    return {"id": 1, "name": "Test User", "email": "test@example.com"}

@pytest.fixture
async def db_session():
    session = await create_test_session()
    yield session
    await session.close()

# Basic test
def test_user_creation(user_data):
    user = User(**user_data)
    assert user.name == "Test User"
    assert user.email == "test@example.com"

# Async test
@pytest.mark.asyncio
async def test_fetch_user(db_session):
    user = await fetch_user(1)
    assert user is not None

# Mocking
@patch('app.services.httpx.AsyncClient')
async def test_fetch_user_api(mock_client):
    # Setup mock
    mock_response = Mock()
    mock_response.json.return_value = {"id": 1, "name": "Test"}
    mock_client.return_value.__aenter__.return_value.get = AsyncMock(
        return_value=mock_response
    )
    
    # Test
    result = await fetch_user(1)
    assert result["name"] == "Test"

# Parametrize
@pytest.mark.parametrize("input,expected", [
    (1, 2),
    (2, 4),
    (3, 6),
])
def test_double(input, expected):
    assert double(input) == expected

# Exception testing
def test_division_by_zero():
    with pytest.raises(ZeroDivisionError):
        divide(10, 0)
```

---

## Performance

### List comprehensions vs loops:
```python
# ✅ Good - list comprehension
squares = [x**2 for x in range(1000)]

# ❌ Bad - append in loop
squares = []
for x in range(1000):
    squares.append(x**2)

# ✅ Good - generator for large data
def process_large_file(filepath: str):
    with open(filepath) as f:
        for line in f:  # Generator, memory efficient
            yield line.strip()

# ❌ Bad - load all at once
def process_large_file_bad(filepath: str):
    with open(filepath) as f:
        return [line.strip() for line in f]  # Loads entire file
```

### Use built-in functions:
```python
# ✅ Good - built-in sum
total = sum(numbers)

# ❌ Bad - manual loop
total = 0
for n in numbers:
    total += n

# ✅ Good - any/all
has_even = any(x % 2 == 0 for x in numbers)
all_positive = all(x > 0 for x in numbers)
```

---

## Project Structure

```
my-project/
├── src/
│   ├── __init__.py
│   ├── main.py              # Entry point
│   ├── config.py            # Settings (use Pydantic)
│   ├── models/              # Data models
│   │   ├── __init__.py
│   │   └── user.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   └── user_service.py
│   ├── api/                 # API routes (if FastAPI)
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependencies
│   │   └── routes/
│   │       └── users.py
│   └── utils/               # Helpers
│       └── __init__.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   └── test_user_service.py
├── pyproject.toml           # Project config (use Poetry/uv)
├── requirements.txt         # Or use pyproject.toml
└── README.md
```

---

## Best Practices

### ✅ DO:
- Use type hints everywhere (Python 3.10+ syntax)
- Use dataclasses for internal models, Pydantic for API
- Use async/await for I/O operations
- Write tests (pytest)
- Use context managers (`with` statement)
- Use generators for large data
- Use `pathlib` instead of `os.path`
- Use f-strings for formatting
- Use `match/case` (Python 3.10+)
- Use `functools.lru_cache` for memoization

### ❌ DON'T:
- Mix sync and async without care
- Use `*` imports
- Mutate function arguments
- Use bare `except:`
- Ignore type hints
- Use `os.path` (use `pathlib`)
- Use `%` or `.format()` (use f-strings)

---

## Common Patterns

### Configuration with Pydantic:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    api_key: str
    debug: bool = False
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Usage
settings = Settings()
```

### Logging setup:
```python
import logging
import sys

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("app.log"),
        ],
    )

logger = logging.getLogger(__name__)
```

### CLI with Typer:
```python
import typer

app = typer.Typer()

@app.command()
def hello(name: str, count: int = 1):
    """Say hello COUNT times to NAME."""
    for _ in range(count):
        typer.echo(f"Hello {name}!")

if __name__ == "__main__":
    app()
```

---

## Package Management

### Use uv (fastest) or Poetry:
```bash
# uv (recommended - fastest)
pip install uv
uv pip install fastapi
uv pip compile requirements.in -o requirements.txt

# Poetry
poetry init
poetry add fastapi
poetry install
```

---

## Resources

- Python Docs: https://docs.python.org/3/
- FastAPI: https://fastapi.tiangolo.com/
- Pydantic: https://docs.pydantic.dev/
- Pytest: https://docs.pytest.org/
- Type hints: https://mypy.readthedocs.io/

---

**Last Updated:** 2026-03-20
