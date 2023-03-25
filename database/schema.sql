-- run 'createdb sharkfin' before anything in the terminal

-- run \i ./database/schema.sql

\c sharkfin1
CREATE EXTENSION IF NOT EXISTS timescaledb;

SET TIME ZONE UTC;

CREATE TABLE IF NOT EXISTS accounts (
  account SERIAL PRIMARY KEY NOT NULL,
  username TEXT NOT NULL
);

COPY accounts (account, username)
FROM '/Users/hyoon/Workspace/rpp2207/BOC/Sharkfin-Backend/accountMock.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS buypwr (
  id SERIAL PRIMARY KEY NOT NULL,
  buy_pwr DOUBLE PRECISION NOT NULL
);

COPY buypwr (id, buy_pwr)
FROM '/Users/hyoon/Workspace/rpp2207/BOC/Sharkfin-Backend/buypwrMock.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS portfolioinstant (
  account INTEGER REFERENCES accounts(account),
  symbol TEXT,
  type TEXT,
  qty INTEGER,
  avg_cost DOUBLE PRECISION,
  buy_pwr INTEGER,
  CONSTRAINT fk_buypwr
    FOREIGN KEY(buy_pwr)
      REFERENCES buypwr(id)
);

COPY portfolioinstant(account, symbol, type, qty, avg_cost, buy_pwr)
FROM '/Users/hyoon/Workspace/rpp2207/BOC/Sharkfin-Backend/instantMock.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS portfoliomins (
  account INTEGER REFERENCES accounts(account),
  symbol TEXT,
  type TEXT,
  time TIMESTAMPTZ,
  qty INTEGER,
  avg_cost DOUBLE PRECISION,
  buy_pwr DOUBLE PRECISION
);

COPY portfoliomins (account, symbol, type, time, qty, avg_cost, buy_pwr)
FROM '/Users/hyoon/Workspace/rpp2207/BOC/Sharkfin-Backend/minutesMock.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS portfoliodays (
  account INTEGER REFERENCES accounts(account),
  symbol TEXT,
  type TEXT,
  time DATE,
  qty INTEGER,
  avg_cost DOUBLE PRECISION,
  buy_pwr DOUBLE PRECISION
);

COPY portfoliodays (account, symbol, type, time, qty, avg_cost, buy_pwr)
FROM '/Users/hyoon/Workspace/rpp2207/BOC/Sharkfin-Backend/daysMock.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS portfolioweeks (
  account INTEGER REFERENCES accounts(account),
  symbol TEXT,
  type TEXT,
  time DATE,
  qty INTEGER,
  avg_cost DOUBLE PRECISION,
  buy_pwr DOUBLE PRECISION
);

COPY portfolioweeks (account, symbol, type, time, qty, avg_cost, buy_pwr)
FROM '/Users/hyoon/Workspace/rpp2207/BOC/Sharkfin-Backend/weeksMock.csv' DELIMITER ',' CSV HEADER;

CREATE INDEX idx_account_symbol_instant ON portfolioinstant (account, symbol);
CREATE INDEX idx_account_symbol_mins ON portfoliomins (account, symbol, time DESC);
CREATE INDEX idx_account_symbol_days ON portfoliodays (account, symbol, time DESC);
CREATE INDEX idx_account_symbol_weeks ON portfolioweeks (account, symbol, time DESC);

\timing