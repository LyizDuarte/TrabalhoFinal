const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;

const usuariosCadastrados = [];
const mensagens = [];
let usuarioLogado = null;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(
  session({
    secret: 'chave',
    resave: true,
    saveUninitialized: true,
  })
);

app.set('view engine', 'ejs');

function GenerarMenu() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Menu Principal</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #262626;
          color: white;
          margin: 0;
          padding: 0;
        }

        h1 {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          margin: 0;
        }

        ul {
          list-style: none;
          padding: 0;
          display: flex;
          justify-content: center;
        }

        li {
          margin: 10px;
        }

        a {
          text-decoration: none;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          background-color: #4CAF50;
        }
      </style>
    </head>
    <body>
      <h1>Menu Principal</h1>
      <ul>
        <li><a href="/cadastro">Cadastro de Usuários</a></li>
        <li><a href="/chat">Bate-papo</a></li>
      </ul>
    </body>
    </html>
  `;
}

function GenerarCadastro(usuariosCadastrados) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cadastro</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #262626;
          color: white;
          margin: 0;
          padding: 0;
        }

        h1 {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          margin: 0;
        }

        form {
          max-width: 400px;
          margin: 20px auto;
          padding: 20px;
          background-color: #333;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: white;
        }

        input, select {
          width: 100%;
          padding: 8px;
          margin-bottom: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }

        button {
          background-color: #4CAF50;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        ul {
          list-style: none;
          padding: 0;
        }

        li {
          background-color: #555;
          margin: 4px 0;
          padding: 8px;
          border-radius: 4px;
        }

        a {
          display: block;
          margin-top: 20px;
          text-align: center;
          text-decoration: none;
          color: #4CAF50;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1>Cadastro de Usuário</h1>
      <form action="/cadastrarUsuario" method="post">
        <label for="nome">Nome:</label>
        <input type="text" id="nome" name="nome" required>

        <label for="dataNascimento">Data de Nascimento:</label>
        <input type="date" id="dataNascimento" name="dataNascimento" required>

        <label for="nickname">Nickname ou Apelido:</label>
        <input type="text" id="nickname" name="nickname" required>

        <button type="submit">Cadastrar</button>
      </form>

      <h2>Usuários Cadastrados</h2>
      <ul>
        ${usuariosCadastrados.map(user => `<li>${user.nome}</li>`).join('')}
      </ul>

      <a href="/">Voltar para o Menu</a>
    </body>
    </html>
  `;
}

function GenerarPaginaChat(usuariosCadastrados, mensagens) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #262626;
            color: white;
            margin: 0;
            padding: 0;
          }
  
          h1 {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            margin: 0;
          }
  
          form {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #333;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
  
          label {
            display: block;
            margin-bottom: 8px;
            color: white;
          }
  
          input {
            width: calc(100% - 16px);
            padding: 8px;
            margin-bottom: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
            display: inline-block;
            color: #333;
          }
  
          button {
            width: 100%;
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            display: inline-block;
          }
  
          ul {
            list-style: none;
            padding: 0;
          }
  
          li {
            background-color: #555;
            margin: 4px 0;
            padding: 8px;
            border-radius: 4px;
          }
  
          a {
            display: block;
            margin-top: 20px;
            text-align: center;
            text-decoration: none;
            color: #4CAF50;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h1>Chat</h1>
        <form action="/postarMensagem" method="post">
          <label for="usuario">Usuário:</label>
          <select id="usuario" name="usuario" required>
            ${usuariosCadastrados.map(user => `<option>${user.nome}</option>`).join('')}
          </select>
  
          <label for="mensagem">Mensagem:</label>
          <input type="text" id="mensagem" name="mensagem" required>
  
          <button type="submit">Enviar</button>
        </form>
  
        <h2>Mensagens</h2>
        <ul>
          ${mensagens.map(msg => `<li>${msg.usuario}: ${msg.texto}</li>`).join('')}
        </ul>
  
        <a href="/">Voltar para o Menu</a>
      </body>
      </html>
    `;
  }

function GenerarPaginaLogin() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #262626;
          color: white;
          margin: 0;
          padding: 0;
        }

        h1 {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          margin: 0;
        }

        form {
          max-width: 400px;
          margin: 20px auto;
          padding: 20px;
          background-color: #333;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        label {
          display: block;
          margin-bottom: 8px;
          color: white;
        }

        input {
          width: 100%;
          padding: 8px;
          margin-bottom: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }

        button {
          width: 100%;
          background-color: #4CAF50;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <h1>Login</h1>
      <form action="/login" method="post">
        <label for="login">Login:</label>
        <input type="text" id="login" name="login" required>

        <label for="senha">Senha:</label>
        <input type="password" id="senha" name="senha" required>

        <button type="submit">Entrar</button>
      </form>
    </body>
    </html>
  `;
}

app.get('/', (req, res) => {
    if (usuarioLogado) {
      res.send(GenerarMenu());
    } else {
      res.redirect('/login');
    }
  });
  
  app.get('/cadastro', (req, res) => {
    if (usuarioLogado) {
      res.send(GenerarCadastro(usuariosCadastrados));
    } else {
      res.redirect('/login');
    }
  });
  
  app.post('/cadastrarUsuario', (req, res) => {
    if (usuarioLogado) {
      const novoUsuario = {
        nome: req.body.nome,
        dataNascimento: req.body.dataNascimento,
        nickname: req.body.nickname,
      };
  
      usuariosCadastrados.push(novoUsuario);
  
      res.send(GenerarCadastro(usuariosCadastrados));
    } else {
      res.redirect('/login');
    }
  });
  
  app.get('/chat', (req, res) => {
    if (usuarioLogado) {
      res.send(GenerarPaginaChat(usuariosCadastrados, mensagens));
    } else {
      res.redirect('/login');
    }
  });
  
  app.post('/postarMensagem', (req, res) => {
    if (usuarioLogado) {
      const novaMensagem = {
        usuario: req.body.usuario,
        texto: req.body.mensagem,
      };
  
      mensagens.push(novaMensagem);
  
      res.redirect('/chat');
    } else {
      res.redirect('/login');
    }
  });
  
  app.get('/login', (req, res) => {
    res.send(GenerarPaginaLogin());
  });
  
  app.post('/login', (req, res) => {
    const loginUsuario = req.body.login;
    const senhaUsuario = req.body.senha;
  
    if (loginUsuario === 'usuario' && senhaUsuario === 'senha') {
      usuarioLogado = true;
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });
  
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });