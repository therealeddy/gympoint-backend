import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class MatriculationMail {
  get key() {
    return 'MatriculationMail';
  }

  async handle({ data }) {
    const { matriculation } = data;

    await Mail.sendMail({
      to: `${matriculation.student.name} <${matriculation.student.email}>`,
      subject: 'Matricula Gympoint',
      text: 'Voce tem uma nova matricula',
      template: 'matriculation',
      context: {
        name: matriculation.student.name,
        age: matriculation.student.age,
        weight: matriculation.student.weight,
        height: matriculation.student.height,
        plan_title: matriculation.plan.title,
        plan_duration: matriculation.plan.duration,
        plan_price: matriculation.plan.price,
        start_date: format(
          parseISO(matriculation.start_date),
          "dd 'de' MMMM 'de' yyyy",
          {
            locale: pt,
          }
        ),
        end_date: format(
          parseISO(matriculation.end_date),
          "dd 'de' MMMM 'de' yyyy",
          {
            locale: pt,
          }
        ),
        total_price: matriculation.total_price,
      },
    });
  }
}

export default new MatriculationMail();
