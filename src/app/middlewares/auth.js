import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import authConfig from '../../config/auth';

// criando middlewares de autenticação

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Verificando se o usuario e prestador ou nao(if esta negado o resultado retornando false)
  if (!authHeader) {
    return res.status(401).json({ error: 'Token is not Providerd' });
  }
  // dividindo o array com split
  const [, token] = authHeader.split(' ');
  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = decoded.id;
  } catch (err) {
    return res.status().json({ error: 'Token invalid' });
  }

  return next();
};
