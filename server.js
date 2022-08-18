if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const db = require("./db");

(async () => {

  //const result = await db.insertCars({ placa: "DBA-2819", modelo: "VW Gol", cor: "Vermelho", responsavel: "Márcio", apartamento: 101, bloco: "A" });
  //console.log(result);

  //const atualizacao = await db.updateCars(7, { placa: "FLA2B18", modelo: "Kia Cerato", cor: "Branco", responsavel: "Nelson", apartamento: 502, bloco: "A" });
  //console.log(atualizacao);

  //const delecao = await db.deleteCars(7);
  const veiculos = await db.selectCars();
  console.log(veiculos);

})();

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const users = []; // variável local para armazenar os usuários em memória

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false })); // para poder usar req.body
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// usando o middleware checkAuthenticated antes de expor a página protegida por login
app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
}); // página que a pessoa precisa estar logada para entrar

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
}); // página de entrada da aplicação, onde o usuário ou adm vão efetuar login

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/form", checkNotAuthenticated, (req, res) => {
  res.render("form.ejs");
}); // página onde o adm vai cadastrar um novo veículo

app.post("/form", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(), // no BD isso é gerado automaticamente
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/");
  } catch {
    res.redirect("/form");
  }
  console.log(users);
});

app.delete("/logout", (req, res, next) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  }); // fornecido pelo passport, encerra a sessão e nos direciona a outra página
});

// Middlewares

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(3000);
