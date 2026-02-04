const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sale = sequelize.define('Sale', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    receiptNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'receipt_number'
    },
    cashierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'cashier_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    vat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    paymentMethod: {
      type: DataTypes.ENUM('Cash', 'M-Pesa', 'Card', 'Credit', 'Bank Transfer'),
      allowNull: false,
      defaultValue: 'Cash',
      field: 'payment_method'
    },
    paymentStatus: {
      type: DataTypes.ENUM('completed', 'pending', 'failed'),
      allowNull: false,
      defaultValue: 'completed',
      field: 'payment_status'
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'customer_name'
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'customer_phone'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'sales',
    timestamps: true,
    indexes: [
      { fields: ['receiptNumber'] },
      { fields: ['cashierId'] },
      { fields: ['paymentMethod'] },
      { fields: ['createdAt'] }
    ]
  });

  return Sale;
};
