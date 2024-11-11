CREATE TABLE device_status (
    id SERIAL PRIMARY KEY,
    value VARCHAR
);


INSERT INTO device_status(value)
VALUES
('GOOD'),
('DEFECT');
