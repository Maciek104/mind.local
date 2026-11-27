
-- LOCAL.MIND
-- SQLite 3

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- USERS

CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,

    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    bio TEXT,
    profile_image_path TEXT,
    plan TEXT NOT NULL DEFAULT 'FREE',

    role TEXT NOT NULL DEFAULT 'USER'
        CHECK (role IN ('USER', 'ADMIN')),

    is_active INTEGER NOT NULL DEFAULT 1
        CHECK (is_active IN (0, 1)),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PLANS

CREATE TABLE plans (
    code TEXT PRIMARY KEY NOT NULL
        CHECK (code IN ('FREE', 'PRO', 'ULTRA')),
    name TEXT NOT NULL,
    storage_limit_bytes INTEGER
        CHECK (storage_limit_bytes IS NULL OR storage_limit_bytes >= 0),
    allowed_models TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO plans (code, name) VALUES
    ('FREE', 'FREE'),
    ('PRO', 'PRO'),
    ('ULTRA', 'ULTRA');

-- DOCUMENTS

CREATE TABLE documents (
    id TEXT PRIMARY KEY NOT NULL,

    user_id TEXT NOT NULL,

    original_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,

    mime_type TEXT,
    file_size INTEGER NOT NULL DEFAULT 0,

    status TEXT NOT NULL DEFAULT 'UPLOADED'
        CHECK (
            status IN (
                'UPLOADED',
                'PROCESSING',
                'COMPLETED',
                'FAILED'
            )
        ),

    extracted_text TEXT,
    error_message TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CHECK (file_size >= 0)
);

CREATE INDEX idx_documents_user_id
    ON documents(user_id);

CREATE INDEX idx_documents_status
    ON documents(status);

-- DOCUMENT CHUNKS

CREATE TABLE document_chunks (
    id TEXT PRIMARY KEY NOT NULL,

    document_id TEXT NOT NULL,

    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,

    -- Embedding BGE-M3 serialized as binary FLOAT32.
    embedding BLOB,

    page_number INTEGER,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    UNIQUE (document_id, chunk_index),

    CHECK (chunk_index >= 0)
);

CREATE INDEX idx_document_chunks_document_id
    ON document_chunks(document_id);

-- CONVERSATIONS

CREATE TABLE conversations (
    id TEXT PRIMARY KEY NOT NULL,

    user_id TEXT NOT NULL,

    title TEXT NOT NULL DEFAULT 'New conversation',

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_conversations_user_id
    ON conversations(user_id);

CREATE INDEX idx_conversations_updated_at
    ON conversations(updated_at DESC);

-- MESSAGES

CREATE TABLE messages (
    id TEXT PRIMARY KEY NOT NULL,

    conversation_id TEXT NOT NULL,

    role TEXT NOT NULL
        CHECK (role IN ('USER', 'ASSISTANT')),

    content TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_messages_conversation_id
    ON messages(conversation_id, created_at);

-- UPDATED_AT TRIGGERS

CREATE TRIGGER trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE TRIGGER trg_plans_updated_at
AFTER UPDATE ON plans
FOR EACH ROW
BEGIN
    UPDATE plans
    SET updated_at = CURRENT_TIMESTAMP
    WHERE code = NEW.code;
END;

CREATE TRIGGER trg_documents_updated_at
AFTER UPDATE ON documents
FOR EACH ROW
BEGIN
    UPDATE documents
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE TRIGGER trg_conversations_updated_at
AFTER UPDATE ON conversations
FOR EACH ROW
BEGIN
    UPDATE conversations
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id
ON auth_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at
ON auth_sessions(expires_at);
