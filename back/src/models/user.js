export default (sequelize, DataTypes) =>
    sequelize.define('User', {
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
    });

