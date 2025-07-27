import db from '../models/index.js';

export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await db.Trainer.findAll();
    res.status(200).json(trainers);
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createTrainer = async (req, res) => {
  try {
    const trainer = await db.Trainer.create(req.body);
    res.status(201).json(trainer);
  } catch (error) {
    console.error('Error creating trainer:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const updateTrainer = async (req, res) => {
  try {
    const trainer = await db.Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    await trainer.update(req.body);
    res.json(trainer);
  } catch (error) {
    console.error('Error updating trainer:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const deleteTrainer = async (req, res) => {
  try {
    const trainer = await db.Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    await trainer.destroy();
    res.json({ message: 'Trainer deleted' });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};