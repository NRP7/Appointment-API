const user_model = (role_num, username, birthDate, gender, address, email, contact_number) => {

    let User = {
        role_num: role_num,
        username: username,
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