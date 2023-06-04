const user_model = (role, username, userpass, first_name, last_name, birthDate, gender, address, email, contact_number) => {

    let User = {
        role: role,
        username: username,
        userpass: userpass,
        first_name: first_name,
        last_name: last_name,
        birthdate: birthDate,
        gender: gender,
        address: address,
        email: email,
        contact_number: contact_number
    }

    return User;

}

module.exports = {
    user_model
}