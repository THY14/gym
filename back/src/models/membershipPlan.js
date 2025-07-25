export default (sequelize, DataTypes) =>
    sequelize.define('MembershipPlan', {
        planName: DataTypes.STRING,
        duration: DataTypes.INTEGER, // in months
        price: DataTypes.FLOAT,
        benefits: DataTypes.TEXT,
        status: DataTypes.STRING // e.g., 'active', 'inactive'
    });