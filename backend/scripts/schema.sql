-- DukaPOS Pro Database Schema
-- PostgreSQL 14+

-- Create tables in correct order (respecting foreign keys)

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'seller' CHECK (role IN ('admin', 'seller')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    reorder_level INTEGER NOT NULL DEFAULT 10,
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 16 CHECK (vat_rate >= 0 AND vat_rate <= 100),
    barcode VARCHAR(50) UNIQUE,
    description TEXT,
    image VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_active ON products(is_active);

-- 5. Sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    cashier_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    vat DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (vat >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    payment_method VARCHAR(20) NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'M-Pesa', 'Card', 'Credit', 'Bank Transfer')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('completed', 'pending', 'failed')),
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_receipt ON sales(receipt_number);
CREATE INDEX idx_sales_cashier ON sales(cashier_id);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);
CREATE INDEX idx_sales_created_at ON sales(created_at);

-- 6. Sale Items table
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0)
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

-- 7. Credit Sales table
CREATE TABLE IF NOT EXISTS credit_sales (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    paid DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (paid >= 0),
    balance DECIMAL(10,2) NOT NULL CHECK (balance >= 0),
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credit_sales_sale ON credit_sales(sale_id);
CREATE INDEX idx_credit_sales_status ON credit_sales(status);
CREATE INDEX idx_credit_sales_due_date ON credit_sales(due_date);

-- 8. Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);

-- 9. Journal Entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    account VARCHAR(100) NOT NULL,
    debit DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
    credit DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
    description TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_entries_date ON journal_entries(date);
CREATE INDEX idx_journal_entries_account ON journal_entries(account);
CREATE INDEX idx_journal_entries_user ON journal_entries(user_id);

-- 10. M-Pesa Transactions table
CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE SET NULL,
    merchant_request_id VARCHAR(100) NOT NULL,
    checkout_request_id VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    mpesa_receipt_number VARCHAR(50),
    transaction_date TIMESTAMP,
    result_desc TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mpesa_checkout_request ON mpesa_transactions(checkout_request_id);
CREATE INDEX idx_mpesa_sale ON mpesa_transactions(sale_id);
CREATE INDEX idx_mpesa_status ON mpesa_transactions(status);

-- 11. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 12. Config table
CREATE TABLE IF NOT EXISTS config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_config_key ON config(key);

-- Insert default admin user
-- Password: Admin@123 (hashed with bcrypt)
INSERT INTO users (name, email, username, password, role, status)
VALUES (
    'System Administrator',
    'admin@dukapos.com',
    'admin',
    '$2a$10$YourHashedPasswordHere',  -- Replace with actual bcrypt hash
    'admin',
    'active'
) ON CONFLICT (username) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('General', 'General merchandise'),
    ('Food & Beverages', 'Food and drink products'),
    ('Electronics', 'Electronic items'),
    ('Clothing', 'Apparel and fashion'),
    ('Home & Garden', 'Home and garden supplies')
ON CONFLICT (name) DO NOTHING;

-- Insert default config
INSERT INTO config (key, value) VALUES
    ('business_name', 'DukaPOS Business'),
    ('kra_pin', ''),
    ('phone', ''),
    ('mpesa_till', ''),
    ('vat_rate', '16'),
    ('currency', 'KES'),
    ('currency_symbol', 'Ksh'),
    ('receipt_footer', 'Thank you for your business!')
ON CONFLICT (key) DO NOTHING;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_sales_updated_at BEFORE UPDATE ON credit_sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mpesa_transactions_updated_at BEFORE UPDATE ON mpesa_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dukapos;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dukapos;
