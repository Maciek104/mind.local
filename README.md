
# 🧠 Knowly

**Knowly** is an AI-powered knowledge management application designed to help users organize, manage and interact with their own knowledge. The system provides an intelligent platform for uploading documents, source code and other files, automatically analyzing their content and organizing them into relevant categories using AI.

The application allows users to upload various file formats, including PDF, DOC, DOCX, TXT and source code files. AI analyzes the provided materials, automatically assigns categories, generates tags and descriptions, and organizes documents into collections, making knowledge easier to navigate and manage.

Knowly also provides an intelligent question-answering system powered by Large Language Models (LLMs). Users can ask questions about their uploaded materials and receive context-aware answers generated exclusively from the provided sources. The system uses Retrieval-Augmented Generation (RAG) to retrieve relevant information and ensure that responses are grounded in the user's own knowledge base.

The main goal of the project is to create an intuitive and intelligent knowledge management solution that simplifies document organization, improves information retrieval and allows users to efficiently interact with their own knowledge.

## 🚀 Tech Stack

### Backend

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

### Database

![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

### AI & Machine Learning

- Large Language Models (LLMs)
- Retrieval-Augmented Generation (RAG)
- Text Embeddings
- Vector Similarity Search

## ⚙️ Main Features

- 📁 Document upload and management (PDF, DOC, DOCX, TXT and source code files)
- 🧠 AI-powered document analysis
- 🗂️ Automatic document categorization
- 🏷️ AI-generated tags and descriptions
- 📚 Collection and category management
- 🔄 Automatic category suggestions and assignment
- 🔍 Semantic document search
- 💬 AI-powered question answering based on uploaded materials
- 📖 Context-aware responses with source references
- 🔗 Document and content retrieval using RAG
- ✏️ Manual document and category management

## 🏗️ System Architecture

Knowly follows a client-server architecture consisting of two main components:

| Component | Technology | Description |
|---|---|---|
| Backend | Python + FastAPI | REST API, business logic and AI integration |
| Frontend | React + Vite + TypeScript | User interface and document management |
| Database | SQLite | Storage of document metadata, categories and collections |
| AI Layer | LLM + RAG | Document analysis, categorization and question answering |
| Vector Search | Embeddings | Semantic retrieval of relevant document content |

## 📂 Supported File Formats

| Format | Description |
|---|---|
| PDF | Portable Document Format |
| DOC | Microsoft Word documents |
| DOCX | Microsoft Word Open XML documents |
| TXT | Plain text files |
| PY | Python source code |
| JS / TS | JavaScript and TypeScript source code |
| Other | Additional supported text-based formats |

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd knowly
```

### 2. Backend setup

```bash
cd knowly-backend

python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows
.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure environment variables using the provided `.env.example` file.

Start the backend:

```bash
fastapi dev app/main.py
```

### 3. Frontend setup

Open another terminal:

```bash
cd knowly-frontend

npm install
npm run dev
```

## 🌐 Development URLs

| Service | URL |
|---|---|
| Backend API | http://localhost:8000 |
| API Documentation (Swagger) | http://localhost:8000/docs |
| API Documentation (ReDoc) | http://localhost:8000/redoc |
| Frontend | http://localhost:5173 |

## 👨‍💻 Author

**Maciej Stępień**

- GitHub: [@Maciek104](https://github.com/Maciek104)
