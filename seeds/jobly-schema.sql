DROP TABLE IF EXISTS companies, users, jobs, applications;

CREATE TABLE companies (
  handle VARCHAR(25) PRIMARY KEY CHECK (handle = lower(handle)),
  name TEXT UNIQUE NOT NULL,
  num_employees INTEGER CHECK (num_employees >= 0),
  description TEXT NOT NULL,
  logo_url TEXT
);

CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary INTEGER CHECK (salary >= 0),
  equity NUMERIC CHECK (equity <= 1.0),
  company_handle VARCHAR(25) NOT NULL
    REFERENCES companies ON DELETE CASCADE
);

CREATE TABLE applications (
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  job_id INTEGER
    REFERENCES jobs ON DELETE CASCADE,
  PRIMARY KEY (username, job_id)
);

-- Trigger function to prevent updates on jobs.company_handle
CREATE OR REPLACE FUNCTION prevent_updates_on_jobs()
RETURNS trigger AS $$
BEGIN 
  IF OLD.company_handle IS DISTINCT FROM NEW.company_handle THEN
      RAISE EXCEPTION 'Updating company_handle in jobs table is not allowed';
  END IF;

  IF OLD.id IS DISTINCT FROM NEW.id THEN
      RAISE EXCEPTION 'Updating id in jobs table is not allowed';
  END IF;
  RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the jobs table
CREATE TRIGGER prevent_updates_on_jobs
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE PROCEDURE prevent_updates_on_jobs();