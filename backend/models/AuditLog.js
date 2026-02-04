const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id'
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entity: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'entity_id'
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address'
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false
  });

  return AuditLog;
};
