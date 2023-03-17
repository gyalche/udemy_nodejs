import mysql from 'mysql2';
import Sequelize from 'sequelize';

const sequelize = new Sequelize('node', 'root', 'dawa', {
  dialect: 'mysql',
  host: 'localhost',
});

export default sequelize;
// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   database: 'node',
//   password: 'password',
// });

// export default pool.promise();
