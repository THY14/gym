import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Classes', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    memberId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Members', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    trainerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Trainers', key: 'id' },
      onDelete: 'NO ACTION',
      onUpdate: 'CASCADE',
    },
    bookingDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'pending', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['classId', 'memberId'],
        name: 'Bookings_classId_memberId_unique',
      },
    ],
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.Class, { foreignKey: 'classId', as: 'class' });
    Booking.belongsTo(models.Member, { foreignKey: 'memberId', as: 'member' });
    Booking.belongsTo(models.Trainer, { foreignKey: 'trainerId', as: 'trainer' });
    Booking.hasOne(models.Payment, { foreignKey: 'bookingId', as: 'payment' });
  };

  return Booking;
};