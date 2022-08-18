async function connect() {
  if (global.connection && global.connection.state !== "disconnected")
    return global.connection;

  const mysql = require("mysql2/promise"); // wrapper com suporte a promises
  const connection = await mysql.createConnection(
    "mysql://root:12345@localhost:3306/login"
  ); // com a string de conexão: usuário:senha@host:porta/database
  console.log("Conectou no MySQL."); // informar no console que conectou
  global.connection = connection;
  return connection;
}

// criando função para exibir todos os usuários do sistema
async function selectUsers() {
  const conn = await connect();
  const [rows] = await conn.query("SELECT * FROM users;");
  return rows;
}

// criando função para exibir todos os carros da lista
async function selectCars() {
  const conn = await connect();
  const [rows] = await conn.query("SELECT * FROM cars;"); // queremos apenas as linhas
  return rows;
}

// criando função para inserir um carro na lista
async function insertCars(car) {
  const conn = await connect();
  const sql = 'INSERT INTO cars(placa, modelo, cor, responsavel, apartamento, bloco) VALUES (?, ?, ?, ?, ?, ?);';
  const values = [car.placa, car.modelo, car.cor, car.responsavel, car.apartamento, car.bloco];
  return await conn.query(sql, values);
}

// criando função para atualizar um carro na lista
async function updateCars(id, car) {
  const conn = await connect();
  const sql = 'UPDATE cars SET placa=?, modelo=?, cor=?, responsavel=?, apartamento=?, bloco=? WHERE id=?;';
  const values = [car.placa, car.modelo, car.cor, car.responsavel, car.apartamento, car.bloco, id];
  return await conn.query(sql, values);
}

// criando função para deletar um carro na lista
async function deleteCars(id) {
  const conn = await connect();
  const sql = 'DELETE FROM cars WHERE id=?;';
  return await conn.query(sql, [id]);
}

module.exports = { selectCars, insertCars, updateCars, deleteCars, selectUsers };
