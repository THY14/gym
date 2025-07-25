export default (sequelize, DataTypes) =>
    sequelize.define('Attendence', {
        date: DataTypes.DATE,
        status: DataTypes.STRING, // e.g., 'present', 'absent', 'late'
        checkInTime: DataTypes.TIME,
        checkOutTime: DataTypes.TIME
    });