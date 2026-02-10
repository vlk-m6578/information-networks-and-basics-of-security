const usersDatabase = {
  'alice': {
    password: 'password123',
    name: 'Alice',
    role: 'student',
    services: ['files', 'email', 'print']
  },
  'bob': {
    password: 'qwerty123',
    name: 'Bob',
    role: 'teacher',
    services: ['files', 'email', 'print', 'admin']
  },
  'eva': {
    password: 'aboba123',
    name: 'Eva',
    role: 'attacker',
    services: []
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