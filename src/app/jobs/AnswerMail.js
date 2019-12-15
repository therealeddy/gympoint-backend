import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  async handle({ data }) {
    const { assistance } = data;

    await Mail.sendMail({
      to: `${assistance.student.name} <${assistance.student.email}>`,
      subject: 'Auxilio Gympoint',
      text: 'Voce tem uma resposta para seu pedido de auxilio',
      template: 'answer',
      context: {
        name: assistance.student.name,
        question: assistance.help.question,
        answer: assistance.help.answer,
        answer_at: format(
          parseISO(assistance.help.answer_at),
          "dd 'de' MMMM 'de' yyyy",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new AnswerMail();
