import db from '../models/index.js';

export const getAllClasses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { trainerId, sort = 'asc' } = req.query;

    const whereClause = {};
    if (trainerId) {
      whereClause.trainerId = trainerId;
    }

    const classes = await db.Class.findAndCountAll({
      where: whereClause,
      include: [{ model: db.Trainer, attributes: ['id', 'name', 'email'] }],
      order: [['schedule', sort.toLowerCase() === 'desc' ? 'DESC' : 'ASC']],
      limit,
      offset,
    });

    res.status(200).json({
      totalItems: classes.count,
      totalPages: Math.ceil(classes.count / limit),
      currentPage: page,
      classes: classes.rows,
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createClass = async (req, res) => {
  try {
    const classData = await db.Class.create(req.body);
    res.status(201).json(classData);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const updateClass = async (req, res) => {
  try {
    const classData = await db.Class.findByPk(req.params.id);
    if (!classData) return res.status(404).json({ message: 'Class not found' });
    await classData.update(req.body);
    res.json(classData);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const classData = await db.Class.findByPk(req.params.id);
    if (!classData) return res.status(404).json({ message: 'Class not found' });
    await classData.destroy();
    res.json({ message: 'Class deleted' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};