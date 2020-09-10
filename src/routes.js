import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controller/UserController';
import SessionController from './app/controller/SessionController';

// middleware
import authMiddlewares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// Rota global
routes.use(authMiddlewares);
routes.post('/files', upload.single('file'), (req, res) => {
  return res.json(req.file);
});
routes.put('/users', UserController.update);

export default routes;
