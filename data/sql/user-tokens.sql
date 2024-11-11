CREATE TABLE user_tokens (
    user_id INTEGER REFERENCES users(id),
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expiresAt TIMESTAMP DEFAULT NOW()
);