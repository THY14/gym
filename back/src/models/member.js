import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Member = sequelize.define('Member', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    membershipPlanId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'MembershipPlans', key: 'id' },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    joinDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    checkIns: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  });

  Member.associate = (models) => {
    Member.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Member.belongsTo(models.MembershipPlan, { foreignKey: 'membershipPlanId', as: 'membershipPlan' });
    Member.hasMany(models.Booking, { foreignKey: 'memberId', as: 'bookings' });
    Member.hasMany(models.Payment, { foreignKey: 'memberId', as: 'payments' });
  };

  return Member;
};