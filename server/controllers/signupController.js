const db = require('../connections/connect');
const users = require('../queries/userQueries');
const profanityFilter = require('../misc/profanityFilter');
const usernameFilter = require('../misc/usernameFilter');
const bcrypt = require('bcrypt');

const signupController = {};

// =================================== //

/**
 * Checks that email and username are formatted properly
 * - determines whether username is valid (no profanity, etc)
 * - note: Imports helper functions from the 'misc' folder
 */

signupController.validateEmailAndUsername = async (req, res, next) => {

  const { email, username } = req.body;

  if (!email.includes('@') || !email.includes('.') ) {
    return res.status(202).send({ error : 'this email is not properly formatted' });
  };

  const filterResult = usernameFilter(username);
  if (filterResult.status === false) {
    return res.status(202).send({ error : filterResult.message });
  };

  if (profanityFilter(username) === true) {
    return res.status(202).send({ error : 'Profanity is not allowed in your username'});
  };

  return next();
};

// =================================== //

/**
 * Checks that password is formatted properly
 * If it's not valid, will send a 202 to the front with a message
 * - on the frontend, 202 messages are programmed to be shown to the user
 */

signupController.validatePassword = async (req, res, next) => {
  
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(202).send({ error : 'passwords do not match'});
  };

  if (password.length < 8) {
    return res.status(202).send({ error : 'password must be more than 8 characters'});
  };

  if (password.length > 20) {
    return res.status(202).send({ error : 'password must be less than 20 characters'});
  };

  return next();
};

// =================================== //

/**
 * - Encrypts the password with bcrypt
 * - stores it in res.locals.password for next middleware
 */

signupController.hashPassword = async (req, res, next) => {

  const { password } = req.body;

  await bcrypt.hash(password, 8, (err, hash) => {
    if (err) {
      console.log('error encrypting password');
      return next(err);
    };
    if (hash) {
      console.log('successfully hashed password', hash)
      res.locals.hashedPassword = hash;
      return next();
    };
  });
};

// =================================== //

/**
 * Creates a new user in DB
 * - Takes the email / username from the frontend
 * - takes the hashedPassword from the previous middleware
 * - With them, creates user in DB
 *  - (next middleware will actually send us the user_id)
 * - Handles errors that MySQL sends back
 * - if there is an error (e.g. user already exists), we send a 202 with a message to the front
 */

signupController.createUser = (req, res, next) => {

  const { email, username } = req.body;
  const password = res.locals.hashedPassword;

  db.query(users.createUser, [email, username, password], (err, result) => {

    if (result) {
      console.log(`successfully created user: ${username}`);
      return next();
    };

    if (err) {
      console.log('error in createUser', err.sqlMessage);
      let error = 'An error occured whlie creating user';

      if (err.code === 'ER_DUP_ENTRY') {
        if (err.sqlMessage.split('.')[1] === `username'`) {
          error = 'This username is already registered.';
        };
        if (err.sqlMessage.split('.')[2] === `email'`) {
          error = 'This email is already registered.';
        }
      };

      return res.status(202).send({ error });
    };
  });
};

// =================================== //

/**
 * Changes the authentication status of the user from 0 -> 1 (false -> true) in database
 * Does this when they click the email verification link
 * - takes the username from locals -- was deconstructed from req.query in last function
 * - authenticates the user in the db
 */

signupController.authenticateUser = (req, res, next) => {

  const { username } = res.locals;
  
  db.query(users.authenticateUser, [username], (err, result) => {

    if (result) {
      console.log('should have authenticated user: ', result);
      return next();
    };

    if (err) {
      console.log('error in authenticateUser', err);
      return next(err);
    };
  });
};

// =================================== //

/**
 * Return the user ID with only the username
 * - uses username input to get the user_id
 * - stores user_id in res.locals
 */

signupController.getUserIdByUsername = (req, res, next) => {

  const { username } = req.body;

  db.query(users.getUserIdByUsername, [username], (err, result) => {

    if (result) {
      const { user_id } = result[0];
      res.locals.user_id = user_id;
      return next();
    };

    if (err) {
      console.log('error in getUserIdByUsername', err);
      return next(err);
    };
  });
};

// =================================== //

/**
 * Deletes your whole account
 * - user_id sent in body
 * - deletes the user's account
 * - make sure to protect this route 
 * NOTE: this could definitely use some refining, haven't paid too much attention to it
 */

signupController.deleteAccount = (req, res, next) => {

  const { user_id } = req.body;

  db.query(users.deleteAccount, [user_id], (err, result) => {
    if (result) {

      if (result.affectedRows === 0) {
        console.log('Could not find account to delete', err);
        return next({ message : 'Error: could not delete account' });
      };

      console.log('successfully deleted account')
      return next();
    };

    if (err) {
      console.log('error in deleteAccount', err);
      return next(err);
    };
  });
};

// =================================== //

module.exports = signupController;