const express = require("express");
const server = express();
const body = require("body-parser");
const mysql = require("mysql2");
const pool = mysql.createPool({
  user: "root",
  password: "",
  database: "3j_imobiliaria",
  host: "localhost",
  port: 3306,
});

server.use(
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, Accept, Content-Type, X-Requested-With, Authorization'
    )

    if(req.method == 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).send({})
    }

    next()
  }
)

server.use(body.urlencoded({ extended: false }));
server.use(body.json());

server.get("/usuarios", (req, res) => {
  pool.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        mensagem: "Não foi possivel estabelecer a conexão com o banco",
        error: error,
      });
    }
    
    const QUERY = "SELECT * FROM usuarios";

    conn.query(QUERY, (error, resultado, campos) => {
      conn.release();

      if (error) {
        return res.status(500).send({
          mensagem: "Não foi possivel realizar a consulta",
          error: error,
        });
      }

      res.status(200).send({
        mensagem: "Conectado com sucesso",
        data: resultado,
      });
    });
  });
});

server.get("/usuario/:id", (req, res) => {
  let id = req.params.id;

  pool.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        mensagem: "Erro ao estabelecer a conexão.",
      });
    }

    const QUERY = "SELECT * FROM usuarios WHERE usuario_id = " + id;

    conn.query(QUERY, (error, resultado, campos) => {
      conn.release();

      if (error) {
        return res.status(500).send({
          mensagem: "Erro na consulta: " + error,
        });
      }

      let retorno = "Usuário não encontrado";

      if (resultado.length > 0) {
        retorno = "Dados retornados";
      }

      return res.status(200).send({
        mensagem: retorno,
        data: resultado,
      });
    });
  });
});

server.post("/usuario", (req, res) => {
  let user = req.body;
  let dados = [user.nome, user.login, user.senha];

  pool.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        mensagem: "Erro ao estabelecer a conexão. " + error,
      });
    }

    const QUERY = "INSERT INTO usuarios (nome, login, senha) VALUES (?, ?, ?)";

    conn.query(QUERY, dados, (error, resultado, campos) => {
      conn.release();

      if (error) {
        return res.status(500).send({
          mensagem: "Erro ao realizar o cadastro. " + error,
        });
      }

      return res.status(200).send({
        mensagem: "Usuário cadastrado com sucesso!",
      });
    });
  });
});

server.delete("/usuario/:id", (req, res) => {
  let id = req.params.id;

  pool.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        mensagem: "Não foi possível estabelecer a conexão. " + error,
      });
    }

    const QUERY = "DELETE FROM usuarios WHERE usuario_id = ?";

    conn.query(QUERY, id, (error, resultado, campos) => {
      conn.release();

      if (error) {
        return res.status(500).send({
          mensagem: "Erro ao excluir usuário. " + error,
        });
      }

      if (resultado.affectedRows == 0) {
        return res.status(400).send({
          mensagem: "Usuário não encontrado.",
        });
      }

      return res.status(200).send({
        mensagem: "Usuário excluído com sucesso!",
      });
    });
  });
});

server.patch("/usuario", (req, res) => {
  let dados = req.body;
  let valores = [dados.nome, dados.login, dados.senha, dados.usuario_id];

  pool.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        mensagem: "Erro ao estabelecer a conexão. " + error,
      });
    }

    const QUERY = "UPDATE usuarios SET nome = ?, login = ?, senha = ? WHERE usuario_id = ?";

    conn.query(QUERY, valores, (error, resultado, campos) => {
      conn.release();

      if (error) {
        if (error.errno == 1048) {
          return res.status(500).send({
            mensagem:
              "Erro ao atualizar usuário: campo obrigatório não informado.",
          });
        }

        return res.status(500).send({
          mensagem: "Erro ao atualizar usuário. " + error,
          codigo: error.errno,
        });
      }

      if (resultado.affectedRows == 0) {
        return res.status(400).send({
          mensagem: "Não foi encontrado um usuário com o ID informado.",
        });
      }

      return res.status(200).send({
        mensagem: "Usuário atualizado com sucesso!",
      });
    });
  });
});

server.get("/", (req, res) => {
  res.status(200).send({
    mensagem: "Servidor funcionando!",
  });
});

server.listen(3000, () => {
  console.log("Servidor funcionando!");
});
