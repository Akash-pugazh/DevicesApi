CREATE TABLE entry_reason (
    id SERIAL PRIMARY KEY,
    value VARCHAR
);

INSERT INTO entry_reason(value)
VALUES
('PERSONAL USE'),
('AT SERVICE CENTER'), 
('WFH'), 
('RETURNED'), 
('TESTING');