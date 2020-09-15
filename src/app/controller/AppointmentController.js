import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

// -----------------//

import User from '../models/User';
import Appointment from '../models/Appointment';
import File from '../models/File';
import Notifition from '../schemas/Notification';
import Queue from '../../lib/Queue';
import CancelationMail from '../jobs/cancellationMail';

// Criando Classe Appointment de serviço
class AppointmentController {
  // Lista agendamento
  async index(req, res) {
    // Fazendo paginação de itens
    const { page = 1 } = req.query;

    const appointment = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'date', 'past', 'cancelable'],

      // Listagem de relacionamentos
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointment);
  }

  // store e metodo de criação
  async store(req, res) {
    // Validação com Yup
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }
    const { provider_id, date } = req.body;

    // ------------------------------------//
    const checkisProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    // Verificado se o Usuario e um provider
    if (!checkisProvider) {
      return res.status(401).json({
        error: 'You can only create appointments with providers',
      });
    }
    // -----------------------------------------------//

    const hourStart = startOfHour(parseISO(date));
    // Validado se a data ja passou
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }
    // ------------------------------------------//

    // Validado se a hora ja foi marcada
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });
    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }
    // ------------------------------------------------------//

    // Inserido registro na tabela appointments
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    // Criando Notifition do prestador de serviços
    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', as' H:mm'h'",
      {
        locale: pt,
      }
    );
    await Notifition.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  // cancelado agendamento por hora
  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permossion to cancel appointment.",
      });
    }
    const dateWithSub = subHours(appointment.date, 2);
    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointments 2 hours in advace.',
      });
    }
    appointment.canceled_at = new Date();

    await appointment.save();
    Queue.add(CancelationMail.key, {
      appointment,
    });
    return res.json(appointment);
  }
}
export default new AppointmentController();
