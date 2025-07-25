export default (sequelize, DataTypes) =>
    sequelize.define('Admin', {
        role: DataTypes.STRING, // e.g., 'superadmin', 'manager'
        permissions: DataTypes.TEXT, // JSON string or text describing permissions
    });


    