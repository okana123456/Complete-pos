const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const JournalEntry = sequelize.define('JournalEntry', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    account: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    debit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    credit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    }
  }, {
    tableName: 'journal_entries',
    timestamps: true
  });

  return JournalEntry;
};
