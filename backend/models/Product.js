const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'suppliers',
        key: 'id'
      }
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    reorderLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      field: 'reorder_level'
    },
    vatRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 16,
      field: 'vat_rate',
      validate: {
        min: 0,
        max: 100
      }
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'products',
    timestamps: true,
    indexes: [
      { fields: ['sku'] },
      { fields: ['categoryId'] },
      { fields: ['supplierId'] },
      { fields: ['barcode'] }
    ]
  });

  return Product;
};
