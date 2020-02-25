const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session')
//must come after the session
const KnexStore = require ('connect-session-knex')(session); //remember to curry and pass the session



const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');
const knex = require('../database/dbConfig'); //needed for stroring sessions in the database


const server = express();

const sessionConfig = {
  name: 'monster',
  secret: 'keep it secret, keep it safe!',
  resave: false,
  saveUninitialized: true, //related to GDPR compliance, false in production
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false, //should be true in production
    httpOnly: true // true means JS can't touch the cookie
  },
  store: new KnexStore({
    // knex: knex
    knex,
    //all lowercase table where we want to store the data
    tablename: 'sessions',
    //if table doesn't exist, create one
    createtable: true,
    //column name
    sidfieldname: 'sid',
    //time in ms, every x min go and check and delete all sessions that have expired. Will check the expiration date, not creation date.
    clearInterval: 1000 * 60 * 15
  })
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));


//at this point there is a req.session object created by express-session available to all endpoints
server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  console.log(req.session);
  res.json({ api: 'up' });
});

module.exports = server;
