CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password TEXT NOT NULL DEFAULT 'PASSWORD',
    email VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email)
VALUES
('Aakash', 'aakash@gmail.com'),
('Virus', 'virus@gmail.com'),
('Jeevan', 'jeevan@gmail.com'),
('Kadavuley Ajithey', 'ajith@gmail.com');