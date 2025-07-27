export default (sequelize, DataTypes) => {
  const TrainingSessionClient = sequelize.define('TrainingSessionClient', {
    sessionId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: {
        model: 'TrainingSessions',
        key: 'id',
      },
    },
    clientId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: {
        model: 'Clients',
        key: 'id',
      },
    },
  }, {
    tableName: 'TrainingSessionClients',
    timestamps: false,
  });

  return TrainingSessionClient;
};