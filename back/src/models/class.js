export default (sequelize, DataTypes) =>
    sequelize.define('Class', {
        className: DataTypes.STRING,
        description: DataTypes.TEXT,
        schedule: DataTypes.STRING, // e.g., 'Monday 6 PM - 7 PM'
        capacity: DataTypes.INTEGER, // maximum number of participants  
        price: DataTypes.FLOAT,
        catagory: DataTypes.STRING, // e.g., 'yoga', 'strength training', 'cardio'
        status: DataTypes.STRING // e.g., 'active', 'inactive'
    });
    