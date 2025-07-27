import db from '../models/index.js';

export const getAllMembers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const orderBy = req.query.orderBy || 'name';
    const direction = req.query.direction || 'asc';
    const orderDirection = direction.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const total = await db.Member.count();
    const members = await db.Member.findAll({
      limit,
      offset,
      order: [[orderBy, orderDirection]],
    });

    if (members.length === 0) {
      return res.status(404).json({ message: 'No members found' });
    }

    res.status(200).json({
      message: 'Members fetched successfully',
      data: members,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    const member = await db.Member.create(req.body);
    res.status(201).json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await db.Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    await member.update(req.body);
    res.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await db.Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    await member.destroy();
    res.json({ message: 'Member deleted' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};

export const recordCheckIn = async (req, res) => {
  try {
    const member = await db.Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    const checkIns = member.checkIns || [];
    checkIns.push({ classId: req.body.classId, date: req.body.date });
    await member.update({ checkIns });
    res.json({ message: 'Check-in recorded', checkIns });
  } catch (error) {
    console.error('Error recording check-in:', error);
    res.status(400).json({ message: 'Invalid input' });
  }
};