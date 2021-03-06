/**
 * All queries for changes to users table
 */

const queries = {};

queries.getUsers = `
  SELECT * FROM users
`;

queries.createUser = `
  INSERT INTO users(email, username, password)
  VALUES(?, ?, ?)
`;

queries.authenticateUser = `
  UPDATE users
  SET authenticated=1, dateCreated=DATE()
  WHERE user_id=?
`;

queries.getUserIdByUsername = `
  SELECT user_id
  FROM users
  WHERE username=?
`;

queries.getUserIdByEmail = `
  SELECT user_id 
  FROM users
  WHERE email=?
`;

queries.getEmailByUserId = `
  SELECT user_id 
  FROM users
  WHERE email=?
`;

queries.getUserById = `
  SELECT * FROM users
  WHERE user_id=?
`;

queries.getPasswordById = `
  SELECT password FROM users
  WHERE user_id=?
`;

queries.updatePassword = `
  UPDATE users
  SET password=?
  WHERE user_id=?
`;

queries.login = `
  UPDATE users
  SET lastLoggedIn=DATE()
  WHERE user_id=?
`;

queries.authenticateUser = `
  UPDATE users
  SET authenticated=1
  WHERE username=?
`;

queries.verifyAuthentication = `
  SELECT authenticated, email, username
  FROM users
  WHERE user_id=?
`;

queries.makeAdmin = `
  UPDATE users
  SET admin=1
  WHERE user_id=?
`;

queries.changePassword = `
  UPDATE users
  SET password=?
  WHERE user_id=?
`;

queries.addUserImage = `
  UPDATE users(image)
  SET image=?
  WHERE user_id=?
`;

queries.deleteAccount = `
  DELETE FROM users
  WHERE user_id=?
`;

module.exports = queries;