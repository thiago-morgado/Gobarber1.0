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
    console.log(req.userId);
    return res.json('ok');
  }
}
export default new UserController();
