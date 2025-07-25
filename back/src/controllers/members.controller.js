import db from '../models/index.js';
import dotenv  from 'dotenv';
dotenv.config();

/**
 * @swagger
 * tags:
 *   - name: Members
 *     description: Members management routes
 */

/**
 * @swagger
 * /members:
 *   get:
 *     summary: Get all members (with optional ordering and pagination)
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of members per page
 *         example: 10  
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [name, email, joinDate, createdAt]
 *         description: Field to order by
 *         example: name
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Order direction (ascending or descending)
 *         example: asc
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           enum: [class, trainer, booking, attendance, payment]
 *         description: Comma-separated list of related models to populate
 *         example: class,booking
 *     responses:
 *       200:
 *         description: List of members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No members found
 *       500:
 *         description: Internal server error
 */



export const getAllMembers = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const orderBy = req.query.orderBy || 'name';
    const direction = req.query.direction || 'asc';
    const orderDirection = direction.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const populate = (req.query.populate || '')
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

    const include = [];
    if (populate.includes('class')) {
        include.push({ model: db.class, as: 'Classes', attributes: ['id', 'name', 'description', 'startTime', 'endTime'] });
    }

  try {
        const total = await db.member.count();
        const members = await db.member.findAll({
            include,
            limit,
            offset  ,
            order: [[orderBy, orderDirection]]
        });

        if (members.length === 0) {
        return res.status(404).json({ message: 'No members found' });
        }

        return res.status(200).json({
            message: 'Members fetched successfully',
            data: members,
            pagination: {
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        return res.status(500).json({ message: 'Internal server error',
            error: error.message, // Add this line for more details
            stack: error.stack    // Optional: add stack trace for debugging
         });

    } 
}
