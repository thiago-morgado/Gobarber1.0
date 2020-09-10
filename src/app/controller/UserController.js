import User from '../models/User';

// Criando a classe do controller,
class UserController {
  // Criando função criação de registro no banco
  async store(req, res) {
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
