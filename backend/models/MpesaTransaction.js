const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MpesaTransaction = sequelize.define('MpesaTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    saleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'sale_id'
    },
    merchantRequestId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'merchant_request_id'
    },
    checkoutRequestId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'checkout_request_id'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    mpesaReceiptNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'mpesa_receipt_number'
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'transaction_date'
    },
    resultDesc: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'result_desc'
    }
  }, {
    tableName: 'mpesa_transactions',
    timestamps: true
  });

  return MpesaTransaction;
};
