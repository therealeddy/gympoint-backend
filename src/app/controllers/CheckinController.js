import { Op } from 'sequelize';
import { startOfDay, subDays, addDays } from 'date-fns';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async show(req, res) {
    const { id: student_id } = req.params;

    const user = await Student.findByPk(student_id);

    if (!user) {
      return res.status(400).json({ error: 'User does not exists' });
    }

    const checkin = await Checkin.findAll({
      where: {
        student_id,
      },
      attributes: ['student_id', 'createdAt'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(checkin);
  }

  async store(req, res) {
    const { id: student_id } = req.params;

    const user = await Student.findByPk(student_id);

    if (!user) {
      return res.status(400).json({ error: 'User does not exists' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id,
        createdAt: {
          [Op.between]: [
            startOfDay(subDays(new Date(), 6)),
            startOfDay(addDays(new Date(), 1)),
          ],
        },
      },
      attributes: ['createdAt'],
    });

    if (checkins.length >= 5) {
      return res.status(400).json({
        error: 'The user has already checked in 5 in the last 7 days',
      });
    }

    const { createdAt } = await Checkin.create({ student_id });

    return res.json({ createdAt });
  }
}

export default new CheckinController();
