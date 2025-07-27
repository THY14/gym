import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Trainer = sequelize.define('Trainer', {
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
    specialization: {
      type: DataTypes.ENUM('yoga', 'weightlifting', 'cardio', 'pilates'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  });

  Trainer.associate = (models) => {
    Trainer.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Trainer.hasMany(models.Class, { foreignKey: 'trainerId', as: 'classes' });
    Trainer.hasMany(models.Booking, { foreignKey: 'trainerId', as: 'bookings' });
  };

  return Trainer;
};