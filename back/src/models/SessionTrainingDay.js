export default (sequelize, DataTypes) => {
  const SessionTrainingDay = sequelize.define('SessionTrainingDay', {
    sessionId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: {
        model: 'TrainingSessions',
        key: 'id',
      },
    },
    day: {
      type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
      allowNull: false,
    },
  }, {
    tableName: 'SessionTrainingDays',
    timestamps: false,
  });

  return SessionTrainingDay;
};