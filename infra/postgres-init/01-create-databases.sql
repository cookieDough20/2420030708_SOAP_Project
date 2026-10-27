-- Creates one database per microservice.
-- Runs automatically the first time the postgres container starts
-- (docker-entrypoint-initdb.d scripts only run against an empty data volume).

CREATE DATABASE food_auth;
CREATE DATABASE food_donor;
CREATE DATABASE food_ngo;
CREATE DATABASE food_logistics;
CREATE DATABASE food_notification;
CREATE DATABASE food_impact;
CREATE DATABASE food_ai;
