export default (sequelize, DataTypes) => {
  const ScheduleAvailableDay = sequelize.define('ScheduleAvailableDay', {
    scheduleId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: {
        model: 'ClassSchedules',
        key: 'id',
      },
    },
    day: {
      type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
      allowNull: false,
    },
  }, {
    tableName: 'ScheduleAvailableDays',
    timestamps: false,
  });

  return ScheduleAvailableDay;
};