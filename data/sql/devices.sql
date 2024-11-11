CREATE TYPE E_DEVICE_STATUS
AS
ENUM('GOOD', 'DEFECT');


CREATE TABLE devices (
    id serial PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    model VARCHAR(25) NOT NULL,
    status E_DEVICE_STATUS DEFAULT 'GOOD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);



INSERT INTO devices (name, model) 
VALUES
('Poco', 'x6-Pro'),
('Poco', 'F5'),
('Redmi', '9-Prime'),
('IPhone', '16 Pro'),
('IPhone', '16 Pro Max');