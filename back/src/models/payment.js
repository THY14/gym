export default (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
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
    classId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'Classes',
        key: 'id',
      },
    },
    sessionId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'TrainingSessions',
        key: 'id',
      },
    },
    membershipPlanId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'MembershipPlans',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM('credit_card', 'cash'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('paid', 'pending'),
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
    tableName: 'Payments',
    timestamps: false,
  });

  return Payment;
};