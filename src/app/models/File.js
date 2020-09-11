import Sequelize, { Model } from 'sequelize';

// criando classe de File
class File extends Model {
  // Criando espelho da tabela file do banco de dados e esportado a model
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}
export default File;
