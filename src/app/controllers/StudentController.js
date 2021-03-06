import * as Yup from 'yup';
import Student from '../models/Student';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .max(120)
        .required(),
      weight: Yup.number()
        .max(200)
        .required(),
      height: Yup.number()
        .max(400)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .max(120)
        .required(),
      weight: Yup.number()
        .max(200)
        .required(),
      height: Yup.number()
        .max(400)
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const user = await Student.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(400).json({ error: 'User not exists' });
    }

    const { id, name, email, age, weight, height } = await user.update(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }
}

export default new UserController();
