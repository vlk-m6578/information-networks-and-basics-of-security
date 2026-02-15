const usersDatabase = {
  'alice': {
    password: 'password123',
    name: 'Alice',
    services: ['files', 'email', 'print']
  },
  'bob': {
    password: 'qwerty123',
    name: 'Bob',
    services: ['files', 'email', 'print', 'admin']
  }
}

function authenticateUser(username, password) {
  if(!usersDatabase[username]) return {success: false, message: 'User not found'};
  if(usersDatabase[username].password !== password) return {success: false, message: 'Incorrect password'};

  return {
    success: true,
    user: {
      username: username,
      name: usersDatabase[username].name,
      role: usersDatabase[username].role,
      services: usersDatabase[username].services
    }
  }
}

function findUser(username) {
  return usersDatabase[username] || null;
}

module.exports = {
  authenticateUser,
  findUser
}