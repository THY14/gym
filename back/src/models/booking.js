export default (sequelize, DataTypes) =>
    sequelize.define('Booking',{
        bookingType: DataTypes.STRING, // e.g., 'class', 'personal training', 'membership'
        bookingDate: DataTypes.DATE,
        status: DataTypes.STRING, // e.g., 'confirmed', 'cancelled', 'pending'
        note: DataTypes.TEXT, // additional notes or instructions
    });