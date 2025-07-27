export default (sequelize, DataTypes) => {
  const CheckIn = sequelize.define('CheckIn', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    clientId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'id',
      },
    },
    gymId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Gyms',
        key: 'id',
      },
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    insertDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updateDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'CheckIns',
    timestamps: false,
  });

  return CheckIn;
};