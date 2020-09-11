import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import User from '../models/User';
import Appointment from '../models/Appointment';
// Criando Classe Appointment de serviço
class AppointmentController {
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
    if()
    // Inserido registro na tabela appointments
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    return res.json(appointment);
  }
}
export default new AppointmentController();
