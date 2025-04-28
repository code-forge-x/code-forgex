-- Enable the TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Market Data Table for financial time series data
CREATE TABLE IF NOT EXISTS market_data (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    open NUMERIC(18,8) NOT NULL,
    high NUMERIC(18,8) NOT NULL,
    low NUMERIC(18,8) NOT NULL,
    close NUMERIC(18,8) NOT NULL,
    volume NUMERIC(18,8) NOT NULL
);

-- Convert to hypertable for time series optimization
SELECT create_hypertable('market_data', 'time', 
  chunk_time_interval => INTERVAL '1 day',
  if_not_exists => TRUE);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data (symbol, time DESC);

-- Backtest Results Table
CREATE TABLE IF NOT EXISTS backtest_results (
    time TIMESTAMPTZ NOT NULL,
    backtest_id VARCHAR(36) NOT NULL,
    strategy_name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    position_type VARCHAR(10) NOT NULL,
    entry_price NUMERIC(18,8) NOT NULL,
    exit_price NUMERIC(18,8) NOT NULL,
    position_size NUMERIC(18,8) NOT NULL,
    profit_loss NUMERIC(18,8) NOT NULL,
    trade_duration INTERVAL,
    exit_reason VARCHAR(50)
);

-- Convert to hypertable
SELECT create_hypertable('backtest_results', 'time', if_not_exists => TRUE);
