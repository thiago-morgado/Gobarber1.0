import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

// criando classe de usuarios
class User extends Model {
  // Criando espelho da tabela  usuario do banco de dados e esportado a model
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    // criando a a ciptografia da senha do usuario.
    // adicionando Hooks
    this.addHook('beforeSave', async (user) => {
      // verificando se a senha no campo password hash
      if (user.password) {
        // Criando range de 8 caracteres para senha
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });
    return this;
  }

  // relacionamento de tabelas user file
  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id' });
  }

  // Criando metodo de comfirmação de senha cadastrada
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}
export default User;
