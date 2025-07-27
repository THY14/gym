export default (sequelize, DataTypes) => {
  const ClassAvailableDay = sequelize.define('ClassAvailableDay', {
    classId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: {
        model: 'Classes',
        key: 'id',
      },
    },
    day: {
      type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
      allowNull: false,
    },
  }, {
    tableName: 'ClassAvailableDays',
    timestamps: false,
  });

  return ClassAvailableDay;
};