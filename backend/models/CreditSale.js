const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CreditSale = sequelize.define('CreditSale', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    saleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'sale_id'
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'customer_name'
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'customer_phone'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'due_date'
    },
    status: {
      type: DataTypes.ENUM('pending', 'partial', 'paid'),
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    tableName: 'credit_sales',
    timestamps: true
  });

  return CreditSale;
};
