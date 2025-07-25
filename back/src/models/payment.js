export default (sequelize, DataTypes) =>
    sequelize.define('Payment', {
        amount: DataTypes.FLOAT,
        date: DataTypes.DATE,
        method: DataTypes.STRING, // e.g., 'credit_card', 'cash', 'bank_transfer'
        status: DataTypes.STRING, // e.g., 'completed', 'pending', 'failed'
    });