import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import AnswerMail from '../jobs/AnswerMail';
import Queue from '../../lib/Queue';

class AnswerController {
  async index(req, res) {
    const helps = await HelpOrder.findAll({
      where: {
        answer: null,
      },
    });

    return res.json(helps);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { answer } = req.body;

    const help = await HelpOrder.findOne({
      where: { id },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!help) {
      return res.status(400).json({ error: 'Help does not exists' });
    }

    if (help.answer !== null) {
      return res.status(400).json({ error: 'Help have a answer' });
    }

    const { name: student_name, email: student_email } = help.student;

    help.answer = answer;
    help.answer_at = new Date();

    await help.save();

    const { question, answer_at } = help;

    await Queue.add(AnswerMail.key, {
      assistance: {
        student: {
          name: student_name,
          email: student_email,
        },
        help: {
          question,
          answer,
          answer_at,
        },
      },
    });

    return res.json(help);
  }
}

export default new AnswerController();
