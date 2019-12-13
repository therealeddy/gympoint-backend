import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      attributes: ['title', 'duration', 'price'],
      order: ['price'],
    });
    return res.json(plans);
  }

  async store(req, res) {
    const { title } = req.body;

    const planExists = await Plan.findOne({
      where: {
        title,
      },
    });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists' });
    }

    const { duration, price } = await Plan.create(req.body);

    return res.json({ title, duration, price });
  }

  async update(req, res) {
    const { title } = req.body;

    const plan = await Plan.findOne({
      where: {
        title,
      },
    });

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    const { duration, price } = await plan.update(req.body);

    return res.json({ title, duration, price });
  }

  async delete(req, res) {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    await plan.destroy();

    return res.json();
  }
}

export default new PlanController();
