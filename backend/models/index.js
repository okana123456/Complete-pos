const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://localhost:5432/dukapos_pro', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Import models
const User = require('./User')(sequelize);
const Product = require('./Product')(sequelize);
const Category = require('./Category')(sequelize);
const Supplier = require('./Supplier')(sequelize);
const Sale = require('./Sale')(sequelize);
const SaleItem = require('./SaleItem')(sequelize);
const CreditSale = require('./CreditSale')(sequelize);
const Expense = require('./Expense')(sequelize);
const JournalEntry = require('./JournalEntry')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const MpesaTransaction = require('./MpesaTransaction')(sequelize);
const Config = require('./Config')(sequelize);

// Define associations
// Product associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

Product.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Supplier.hasMany(Product, { foreignKey: 'supplierId', as: 'products' });

// Sale associations
Sale.belongsTo(User, { foreignKey: 'cashierId', as: 'cashier' });
User.hasMany(Sale, { foreignKey: 'cashierId', as: 'sales' });

Sale.hasMany(SaleItem, { foreignKey: 'saleId', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });

SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(SaleItem, { foreignKey: 'productId', as: 'saleItems' });

// Credit Sale associations
CreditSale.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
Sale.hasOne(CreditSale, { foreignKey: 'saleId', as: 'credit' });

// M-Pesa transaction associations
MpesaTransaction.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
Sale.hasOne(MpesaTransaction, { foreignKey: 'saleId', as: 'mpesaTransaction' });

// Expense associations
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });

// Journal Entry associations
JournalEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(JournalEntry, { foreignKey: 'userId', as: 'journalEntries' });

// Audit Log associations
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Supplier,
  Sale,
  SaleItem,
  CreditSale,
  Expense,
  JournalEntry,
  AuditLog,
  MpesaTransaction,
  Config
};
