import db from '../models/index.js';

export const getAllPayments = async (req, res) => {
  try {
    const payments = await db.Payment.findAll();
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPayment = async (req, res) => {
  try {
    const payment = await db.Payment.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await db.Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    await payment.update(req.body);
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const payment = await db.Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    await payment.destroy();
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};