#!/bin/bash

database="Task Db"

echo "Configuring db $database"

dropdb taskDb --if-exists
createdb taskDb 


psql -U aakash taskDb < ./data/sql/device-status.sql
psql -U aakash taskDb < ./data/sql/entry-reason.sql
psql -U aakash taskDb < ./data/sql/users.sql
psql -U aakash taskDb < ./data/sql/devices.sql
psql -U aakash taskDb < ./data/sql/entries.sql

echo "$database setup"
