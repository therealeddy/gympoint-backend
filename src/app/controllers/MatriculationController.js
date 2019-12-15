import {
  parseISO,
  isBefore,
  setSeconds,
  setMinutes,
  setHours,
  addMonths,
} from 'date-fns';
import * as Yup from 'yup';
import Matriculation from '../models/Matriculation';
import Student from '../models/Student';
import Plan from '../models/Plan';

import MatriculationMail from '../jobs/MatriculationMail';
import Queue from '../../lib/Queue';

class MatriculationController {
  async index(req, res) {
    const matriculation = await Matriculation.findAll({
      attributes: ['student_id', 'plan_id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email', 'age', 'weight', 'height'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration', 'price'],
        },
      ],
    });

    return res.json(matriculation);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Studend does not exists' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    const matriculationExists = await Matriculation.findOne({
      where: {
        student_id,
      },
    });

    if (matriculationExists) {
      return res
        .status(400)
        .json({ error: 'Enrollment already registered for this student' });
    }

    const dateFormat = setSeconds(
      setMinutes(setHours(parseISO(start_date), 0), 0),
      0
    );

    if (isBefore(dateFormat, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const end_date = addMonths(dateFormat, plan.duration);

    const price = plan.totalPrice();

    const matriculation = await Matriculation.create({
      student_id,
      plan_id,
      start_date: dateFormat,
      end_date,
      price,
    });

    await Queue.add(MatriculationMail.key, {
      matriculation: {
        student,
        plan,
        start_date: dateFormat,
        end_date,
        total_price: price,
      },
    });

    return res.json(matriculation);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const id_matriculation = Number(req.params.id);

    const matriculation = await Matriculation.findByPk(req.params.id);

    if (!matriculation) {
      return res.status(400).json({ error: 'Matriculation does not exists' });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Studend does not exists' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    const matriculationExists = await Matriculation.findOne({
      where: {
        student_id,
      },
    });

    if (matriculationExists && matriculationExists.id !== id_matriculation) {
      return res
        .status(400)
        .json({ error: 'This student already has an enrollment' });
    }

    const dateFormat = setSeconds(
      setMinutes(setHours(parseISO(start_date), 0), 0),
      0
    );

    if (isBefore(dateFormat, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const end_date = addMonths(dateFormat, plan.duration);

    const price = plan.totalPrice();

    const matricularion = await matriculation.update({
      student_id,
      plan_id,
      start_date: dateFormat,
      end_date,
      price,
    });

    return res.json(matricularion);
  }

  async delete(req, res) {
    const matriculation = await Matriculation.findByPk(req.params.id);

    if (!matriculation) {
      return res.status(400).json({ error: 'Matriculation does not exists' });
    }

    await matriculation.destroy();

    return res.json(matriculation);
  }
}

export default new MatriculationController();
