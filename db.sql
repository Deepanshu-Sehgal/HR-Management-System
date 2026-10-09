BEGIN;
 
-- ============================================================
-- 1. CUSTOMERS
-- ============================================================
 
CREATE TABLE customers (
    customer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_number VARCHAR(30) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT uq_customers_number
        UNIQUE (customer_number),
 
    CONSTRAINT uq_customers_email
        UNIQUE (email),
 
    CONSTRAINT chk_customers_name
        CHECK (
            length(trim(first_name)) > 0
            AND length(trim(last_name)) > 0
        )
);
 
 
-- ============================================================
-- 2. ACCOUNTS
-- ============================================================
 
CREATE TABLE accounts (
    account_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    account_number VARCHAR(30) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'NZD',
    balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT uq_accounts_number
        UNIQUE (account_number),
 
    CONSTRAINT fk_accounts_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers (customer_id)
        ON DELETE RESTRICT,
 
    CONSTRAINT chk_accounts_type
        CHECK (
            account_type IN (
                'checking',
                'savings',
                'business'
            )
        ),
 
    CONSTRAINT chk_accounts_balance
        CHECK (balance >= 0),
 
    CONSTRAINT chk_accounts_currency
        CHECK (currency ~ '^[A-Z]{3}$')
);
 
 
-- ============================================================
-- 3. TRANSACTIONS
-- ============================================================
 
CREATE TABLE account_transactions (
    transaction_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount NUMERIC(18, 2) NOT NULL,
    reference VARCHAR(100),
    description VARCHAR(500),
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts (account_id)
        ON DELETE RESTRICT,
 
    CONSTRAINT chk_transactions_type
        CHECK (
            transaction_type IN (
                'deposit',
                'withdrawal',
                'transfer'
            )
        ),
 
    CONSTRAINT chk_transactions_amount
        CHECK (amount > 0)
);
 
 
-- ============================================================
-- 4. TRANSFERS
-- ============================================================
 
CREATE TABLE transfers (
    transfer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    from_account_id BIGINT NOT NULL,
    to_account_id BIGINT NOT NULL,
    amount NUMERIC(18, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
 
    CONSTRAINT fk_transfers_from_account
        FOREIGN KEY (from_account_id)
        REFERENCES accounts (account_id)
        ON DELETE RESTRICT,
 
    CONSTRAINT fk_transfers_to_account
        FOREIGN KEY (to_account_id)
        REFERENCES accounts (account_id)
        ON DELETE RESTRICT,
 
    CONSTRAINT chk_transfers_different_accounts
        CHECK (from_account_id <> to_account_id),
 
    CONSTRAINT chk_transfers_amount
        CHECK (amount > 0),
 
    CONSTRAINT chk_transfers_status
        CHECK (
            status IN (
                'pending',
                'completed',
                'failed',
                'cancelled'
            )
        )
);
 
 
-- ============================================================
-- INDEXES
-- ============================================================
 
-- Customer account lookup.
CREATE INDEX idx_accounts_customer_id
    ON accounts (customer_id);
 
 
-- Active accounts for a customer.
CREATE INDEX idx_accounts_customer_active
    ON accounts (customer_id, account_id)
    WHERE is_active = TRUE;
 
 
-- Recent transactions for an account.
CREATE INDEX idx_transactions_account_date
    ON account_transactions (
        account_id,
        transaction_date DESC
    );
 
 
-- Transaction filtering by type.
CREATE INDEX idx_transactions_account_type_date
    ON account_transactions (
        account_id,
        transaction_type,
        transaction_date DESC
    );
 
 
-- Find outgoing transfers.
CREATE INDEX idx_transfers_from_account_date
    ON transfers (
        from_account_id,
        created_at DESC
    );
 
 
-- Find incoming transfers.
CREATE INDEX idx_transfers_to_account_date
    ON transfers (
        to_account_id,
        created_at DESC
    );
 
 
-- Find transfers waiting to be processed.
CREATE INDEX idx_transfers_pending
    ON transfers (created_at)
    WHERE status = 'pending';
 
 
-- ============================================================
-- SAMPLE DATA
-- ============================================================
 
INSERT INTO customers (
    customer_number,
    first_name,
    last_name,
    email,
    phone
)
VALUES
    (
        'CUS-10001',
        'James',
        'Wilson',
        'james@example.com',
        '+64-21-555-1001'
    ),
    (
        'CUS-10002',
        'Sarah',
        'Brown',
        'sarah@example.com',
        '+64-21-555-1002'
    );
 
 
INSERT INTO accounts (
    customer_id,
    account_number,
    account_type,
    currency,
    balance
)
VALUES
    (
        1,
        'ACC-10001',
        'checking',
        'NZD',
        5000.00
    ),
    (
        1,
        'ACC-10002',
        'savings',
        'NZD',
        15000.00
    ),
    (
        2,
        'ACC-10003',
        'checking',
        'NZD',
        7500.00
    );
 
 
-- ============================================================
-- DEPOSIT TRANSACTION
-- ============================================================
 
BEGIN;
 
-- Lock the account before changing its balance.
SELECT
    account_id,
    balance
FROM accounts
WHERE account_id = 1
FOR UPDATE
 
 
-- Update account balance.
UPDATE accounts
 
    balance = balance + 1000.00
WHERE account_id = 1;
 
 
-- Record transaction.
INSERT INTO account_transactions (
    account_id,
    transaction_type,
    amount,
    reference,
    description
)
VALUES (
    1,
    'deposit',
    1000.00,
    'DEP-100001',
    'Cash deposit'
);
 
COMMIT;
 
 
-- ============================================================
-- WITHDRAWAL
-- ============================================================
 
BEGIN;
 
-- Lock account and check current balance.
SELECT
    account_id,
    balance
FROM accounts
WHERE account_id = 1
  AND is_active = TRUE
FOR UPDATE;
 
 
-- Only withdraw if sufficient balance exists.
UPDATE accounts
SET
    balance = balance - 500.00
WHERE account_id = 1
  AND balance >= 500.00;
 
 
-- Record withdrawal.
INSERT INTO account_transactions (
    account_id,
    transaction_type,
    amount,
    reference,
    description
)
VALUES (
    1,
    'withdrawal',
    500.00,
    'WD-100001',
    'ATM withdrawal'
);
 
COMMIT;
 
 
-- ============================================================
-- TRANSFER BETWEEN ACCOUNTS
-- ============================================================
 
BEGIN;
 
-- Lock both accounts in consistent order.
SELECT
    account_id,
    balance
FROM accounts
WHERE account_id IN (1, 3)
ORDER BY account_id
FOR UPDATE;
 
 
-- Deduct money from sender.
UPDATE accounts
SET balance = balance - 750.00
WHERE account_id = 1
  AND balance >= 750.00;
 
 
-- Add money to receiver.
UPDATE accounts
SET balance = balance + 750.00
WHERE account_id = 3;
 
 
-- Create transfer record.
INSERT INTO transfers (
    from_account_id,
    to_account_id,
    amount,
    status,
    reference
)
VALUES (
    1,
    3,
    750.00,
    'completed',
    'TRF-100001'
);
 
 
-- Record outgoing transaction.
INSERT INTO account_transactions (
    account_id,
    transaction_type,
    amount,
    reference,
    description
)
VALUES (
    1,
    'transfer',
    750.00,
    'TRF-100001',
    'Transfer to account 3'
);
 
 
-- Record incoming transaction.
INSERT INTO account_transactions (
    account_id,
    transaction_type,
    amount,
    reference,
    description
)
VALUES (
    3,
    'transfer',
    750.00,
    'TRF-100001',
    'Transfer from account 1'
);
 
COMMIT;
 
 
-- ============================================================
-- USEFUL QUERIES
-- ============================================================
 
-- ------------------------------------------------------------
-- 1. Customer accounts
-- ------------------------------------------------------------
 
SELECT
    a.account_id,
    a.account_number,
    a.account_type,
    a.currency,
    a.balance
FROM accounts AS a
WHERE a.customer_id = 1
  AND a.is_active = TRUE
ORDER BY a.account_id;
 
 
-- ------------------------------------------------------------
-- 2. Latest account transactions
-- ------------------------------------------------------------
 
SELECT
    t.transaction_id,
    t.transaction_type,
    t.amount,
    t.reference,
    t.description,
    t.transaction_date
FROM account_transactions AS t
WHERE t.account_id = 1
ORDER BY t.transaction_date DESC
LIMIT 50;
 
 
-- ------------------------------------------------------------
-- 3. Account statement for a date range
-- ------------------------------------------------------------
 
SELECT
    t.transaction_id,
    t.transaction_type,
    t.amount,
    t.description,
    t.transaction_date
FROM account_transactions AS t
WHERE t.account_id = 1
  AND t.transaction_date >= '2026-01-01'
  AND t.transaction_date < '2026-02-01'
ORDER BY t.transaction_date DESC;
 
 
-- ------------------------------------------------------------
-- 4. Pending transfers
-- ------------------------------------------------------------
 
SELECT
    t.transfer_id,
    t.from_account_id,
    t.to_account_id,
    t.amount,
    t.reference,
    t.created_at
FROM transfers AS t
WHERE t.status = 'pending'
ORDER BY t.created_at
LIMIT 100;
 
 
-- ------------------------------------------------------------
-- 5. Customers with total account balance
-- ------------------------------------------------------------
 
SELECT
    c.customer_id,
    c.customer_number,
    c.first_name,
    c.last_name,
    COALESCE(SUM(a.balance), 0) AS total_balance
FROM customers AS c
LEFT JOIN accounts AS a
    ON a.customer_id = c.customer_id
   AND a.is_active = TRUE
GROUP BY
    c.customer_id,
    c.customer_number,
    c.first_name,
    c.last_name
ORDER BY total_balance DESC;
 
 
-- ============================================================
-- PERFORMANCE TESTING
-- ============================================================
 
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    t.transaction_id,
    t.transaction_type,
    t.amount,
    t.transaction_date
FROM account_transactions AS t
WHERE t.account_id = 1
ORDER BY t.transaction_date DESC
LIMIT 50;
 
 
-- ============================================================
-- MAINTENANCE
-- ============================================================
 
ANALYZE customers;
ANALYZE accounts;
ANALYZE account_transactions;
ANALYZE transfers;

COMMIT;
