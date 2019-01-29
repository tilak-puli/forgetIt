const Express = require("./express");
const app = new Express();
const { fileHandler, readPostedData, loadUserData } = require("./fileHandler");
const {
  updateTodo,
  createNewTodo,
  getTodoItems,
  getTodos,
  deleteTodo
} = require("./todoHandlers");
const Users = require("./users");
const { cookieHandler } = require("./cookie");
const { loginUser, logoutUser } = require("./authentication");
const { TODO_PAGE_PATH, ALL_TODOS_PAGE_PATH } = require("./constants");

let users; //global object
let activeUsers = {}; //global object

const logRequest = function(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
};

const homepageHandler = function(req, res) {
  const { auth_key } = req.cookies;
  if (activeUsers[auth_key]) {
    res.redirect("/lists");
    return;
  }
  fileHandler(req, res);
};

const logoutHandler = (req, res) => {
  req.currUser = undefined;
  logoutUser(res);
};

const loginHandler = (req, res) => {
  let user = JSON.parse(req.body);
  const userId = users.getUserId(user);
  if (userId) {
    loginUser(userId, activeUsers, res);
    return;
  }
  res.send("Try again");
};

const isUserActive = function(req, res, next) {
  const { auth_key } = req.cookies;
  if (!activeUsers[auth_key]) {
    res.redirect("/");
    return;
  }
  req.currUser = activeUsers[auth_key];
  next();
};

// initialize
const userData = loadUserData();
users = new Users(userData);

const getAllTodosPage = (req, res, next) =>
  fileHandler(req, res, next, ALL_TODOS_PAGE_PATH);
const getSpecificTodoPage = (req, res, next) =>
  fileHandler(req, res, next, TODO_PAGE_PATH);

app.use(cookieHandler);
app.use(readPostedData);
app.use(logRequest);
app.get("/", homepageHandler);
app.get("/style.css", fileHandler);
app.get("/login.js", fileHandler);
app.post("/login", loginHandler);
app.use(isUserActive);
app.get("/logout", logoutHandler);
app.post("/newList", createNewTodo);
app.get("/todoLists", getTodos);
app.get(/\/lists\/del\/.*/, deleteTodo);
app.get(/\/lists\/.*\.json/, getTodoItems);
app.post("/saveTodo", updateTodo);
app.get(/\/lists\/.*/, getSpecificTodoPage);
app.get(/\/lists/, getAllTodosPage);
app.use(fileHandler);

module.exports = app.handleRequest.bind(app);
