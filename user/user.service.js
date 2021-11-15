const addLocalUser = (User) => ({ id, email, username, password, type }) => {
    const user = new User({
        id,
        username,
        email,
        password,
        type,
        source: "local"
    })
    return user.save()
}

const getUsers = (User) => () => {
    return User.find({})
}

const getUserByEmail = (User) => async({ email }) => {
    return await User.findOne({ email })
}
const getUserByUsername = (User) => async({ username }) => {
    return await User.findOne({ username })
}

module.exports = (User) => {
    return {
        addLocalUser: addLocalUser(User),
        getUsers: getUsers(User),
        getUserByEmail: getUserByEmail(User),
        getUserByUsername: getUserByUsername(User)

    }
}