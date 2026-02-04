const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Config = sequelize.define('Config', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'config',
    timestamps: true
  });

  return Config;
};
