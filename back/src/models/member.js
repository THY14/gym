export default (sequelize, DataTypes) =>
    sequelize.define('Member', {
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        membershipType: DataTypes.STRING,
        joinDate: DataTypes.DATE,
        status: DataTypes.STRING
    });
    