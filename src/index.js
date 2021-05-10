const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const User = users.find((user) => user.username === username)

  if(!User)
    return response.status(404).json({error: "User Not Found"})
  
  request.user = User;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExist = users.find((user)=> user.username === username)

  if(userExist)
    return response.status(400).json({error: "User Already Exists"})

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  return response.status(201).json(user);
});
app.use(checksExistsUserAccount);
app.get('/todos', (request, response) => {

  const user  = request.user;

  return response.json(user.todos);

});

app.post('/todos', (request, response) => {
  const { title , deadline } = request.body;
  const { user } = request;

  const todoExercise = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todoExercise);
  return response.status(201).json(todoExercise);


});

app.put('/todos/:id', (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo)
    return response.status(404).json({error: "Todo Not Found"});
  
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo)

});

app.patch('/todos/:id/done', (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo)=> todo.id === id)

  if(!todo)
    return response.status(404).json({error: "Todo Not Found"})
  
  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo)=> todo.id === id)

  if(todoIndex == -1)
    return response.status(404).json({error: "Todo Not Found"})
  
  user.todos.splice(todoIndex, 1);
  return response.status(204).send();

});

module.exports = app;