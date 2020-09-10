import * as Yup from 'yup';
import User from '../models/User';

// implemtendo Yup de validação de entrada do usuario
// Criando a classe do controller,
class UserController {
  // Criando função criação de registro no banco
  async store(req, res) {
    // Validação de entrada do usuario
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    // Verificando se exite usuario com email inseriodo pelo usuario
    const userExist = await User.findOne({ where: { email: req.body.email } });
    if (userExist) {
      return res.status(400).json({ error: 'User Already exists' });
    }

    // destruturando requição do usuario na criação
    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  // Criando metodo de autualização dos dados do usuario
  async update(req, res) {
    // Validação de entrada do usuario
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    // ---------------------------------------------------------------//
    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);
    // Verificado se usuario existe para alteração de senha
    if (email !== user.email) {
      const userExist = await User.findOne({ where: { email } });
      if (userExist) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    // verifica se OldPassword e a mesma cadastra no banco
    // IF ESTA FAZENDO SE CASO O USUARIO TROCAR A SENHA
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }
    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}
export default new UserController();
