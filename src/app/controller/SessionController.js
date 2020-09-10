import jwt from 'jsonwebtoken';
import User from '../models/User';
import authConfig from '../../config/auth';

// Criando Autenticação com jwt
// criando classe session
class SessionController {
  async store(req, res) {
    // Pegando email e senha de usuario cadastra para gera um token
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'User not Found' });
    }
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }
    // Gerando Token do Aplicação
    const { id, name } = user;
    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
