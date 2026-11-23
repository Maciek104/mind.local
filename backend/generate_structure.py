
from pathlib import Path

PROJECT_STRUCTURE = {
    "app": {
        "api": {
            "v1": {
                "endpoints": {
                    "documents.py": "",
                    "chat.py": "",
                },
                "router.py": "",
            },
        },
        "core": {
            "__init__.py": "",
            "config.py": "",
            "security.py": "",
        },
        "models": {
            "__init__.py": "",
        },
        "schemas": {
            "__init__.py": "",
            "document.py": "",
            "chat.py": "",
        },
        "services": {
            "__init__.py": "",
            "document_service.py": "",
            "llm_service.py": "",
        },
        "utils": {
            "__init__.py": "",
        },
        "__init__.py": "",
        "main.py": "",
    },
    "tests": {
        "__init__.py": "",
        "test_main.py": "",
    },
    ".env.example": "",
    ".gitignore": "",
    "Dockerfile": "",
    "pyproject.toml": "",
    "README.md": "",
}


def create_structure(base_path: Path, structure: dict):
    for name, content in structure.items():
        path = base_path / name

        if isinstance(content, dict):
            path.mkdir(parents=True, exist_ok=True)
            create_structure(path, content)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.touch(exist_ok=True)


if __name__ == "__main__":
    create_structure(Path.cwd(), PROJECT_STRUCTURE)
    print("Knowly backend structure created successfully!")
