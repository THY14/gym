export default (sequelize, DataTypes) => {
  const ClassSchedule = sequelize.define('ClassSchedule', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    classId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Classes',
        key: 'id',
      },
    },
    time: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    participants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    trainerId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Users',
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
    tableName: 'ClassSchedules',
    timestamps: false,
  });

  return ClassSchedule;
};