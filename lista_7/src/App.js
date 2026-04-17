const { createYoga, createSchema } = require('graphql-yoga');
const { createServer } = require('node:http');
const fs = require('node:fs');
const axios = require("axios")
const path = require('node:path');

const schemaPath = path.join(__dirname, 'schema.graphql'); // Using path for safe schema file access
const typeDefs = fs.readFileSync('./src/schema.graphql', 'utf8');

const usersList = [
    { id: 1, name: "Jan Konieczny", email: "jan.konieczny@wonet.pl", login: "jkonieczny" },
    { id: 2, name: "Anna Wesołowska", email: "anna.w@sad.gov.pl", login: "anna.wesołowska" },
    { id: 3, name: "Piotr Waleczny", email: "piotr.waleczny@gp.pl", login: "p.waleczny" }
];

const todosList = [
    { id: 1, title: "Naprawić samochód", completed: false, user_id: 3 },
    { id: 2, title: "Posprzątać garaż", completed: true, user_id: 3 },
    { id: 3, title: "Napisać e-mail", completed: false, user_id: 3 },
    { id: 4, title: "Odebrać buty", completed: false, user_id: 2 },
    { id: 5, title: "Wysłać paczkę", completed: true, user_id: 2 },
    { id: 6, title: "Zamówic kuriera", completed: false, user_id: 3 },
];

async function getRestUsersList(){
    try {
        const users = await axios.get("https://jsonplaceholder.typicode.com/users")
        return users.data.map(({ id, name, email, username }) => ({
            id: id,
            name: name,
            email: email,
            login: username,
        }))
        } 
    catch (error) {
        throw error
    }
}

async function getRestUserById(userId){
    try {
        const user = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}`)
        return {
            id: user.data.id,
            name: user.data.name,
            email: user.data.email,
            login: user.data.username,
        }
    } catch (error) {
        throw error
    }
}

async function getRestTodosList() {
    try {
        const todos = await axios.get("https://jsonplaceholder.typicode.com/todos");
        return todos.data.map(({ id, userId, title }) => ({
            id: id,
            userId: userId,
            title: title
        }))
    } catch (error) {
        throw error;
    }
}

async function getRestTodoById(todoId) {
    try {
        const todo = await axios.get(`https://jsonplaceholder.typicode.com/todos/${todoId}`);
        return {
            id: todo.data.id,
            userId: todo.data.userId,
            title: todo.data.title
        }
    }
    catch (error) {
        return null;
    }
}

async function getRestTodosByUserId(userId) {
    try {
        const todos = await axios.get(`https://jsonplaceholder.typicode.com/users/${userId}/todos`);
        return todos.data.map(({ id, userId, title }) => ({
            id: id,
            userId: userId,
            title: title
        }))
    } catch (error) {
        return [];
    }
}

const resolvers = {
  Query: {
    users: async () => getRestUsersList(),
    todos: () => getRestTodosList(),
    todo: (parent, args, context, info) => getRestTodoById(args.id),
    user: async (parent, args, context, info) => getRestUserById(args.id),
  },
  User:{
    todos: (parent, args, context, info) => {
        return getRestTodosByUserId(parent.id);
    }
  },
  ToDoItem:{
    user: (parent, args, context, info) => {
        return getRestUserById(parent.userId);
    }
  },
};

const schema = createSchema({ typeDefs, resolvers });
const yoga = createYoga({ schema });
const server = createServer(yoga);

server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});