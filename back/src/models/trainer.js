export default (sequelize, DataTypes) =>
    sequelize.define('Trainer', {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        specialization: DataTypes.STRING, // e.g., 'yoga', 'weightlifting'
        experience: DataTypes.INTEGER, // in years
        status: DataTypes.STRING // e.g., 'active', 'inactive'
    });
    