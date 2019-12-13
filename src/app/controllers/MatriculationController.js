import {
  parseISO,
  isBefore,
  setSeconds,
  setMinutes,
  setHours,
  addMonths,
} from 'date-fns';
import Matriculation from '../models/Matriculation';
import Student from '../models/Student';
import Plan from '../models/Plan';

class MatriculationController {
  async index(req, res) {
    const matriculation = await Matriculation.findAll({
      attributes: ['student_id', 'plan_id', 'start_date', 'end_date', 'price'],
    });

    return res.json(matriculation);
  }

  async store(req, res) {
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

    const price = plan.duration * plan.price;

    const matriculation = {
      student_id,
      plan_id,
      start_date: dateFormat,
      end_date,
      price,
    };

    await Matriculation.create(matriculation);

    return res.json(matriculation);
  }

  async update(req, res) {
    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Studend does not exists' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    const matriculation = await Matriculation.findByPk(req.params.id);

    if (!matriculation) {
      return res.status(400).json({ error: 'Matriculation does not exists' });
    }

    const matriculationExists = await Matriculation.findOne({
      where: {
        student_id,
      },
    });

    if (
      matriculationExists &&
      matriculationExists.id !== Number(req.params.id)
    ) {
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

    const price = plan.duration * plan.price;

    await matriculation.update({
      student_id,
      plan_id,
      start_date: dateFormat,
      end_date,
      price,
    });

    return res.json({
      student_id,
      plan_id,
      start_date: dateFormat,
      end_date,
      price,
    });
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
