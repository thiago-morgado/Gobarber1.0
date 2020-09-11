// Criando ligação com banco de dados
import Sequelize from 'sequelize';

import User from '../app/models/User';
import File from '../app/models/File';
import databaseConfig from '../config/database';

const models = [User, File];

// criando class de comunicação com o banco de dados

class Databese {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models.map((model) => model.init(this.connection));
    models.map(
      (model) => model.associate && model.associate(this.connection.models)
    );
  }
}
export default new Databese();
