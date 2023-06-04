
//const key = "javascript123456";

// const test = () => {

//     const key = "javascript123456";
//     const plainText = "Hell0, world!";
//     const password = "S1rD4ve"

//     // const hashed = cryptoJS.SHA1(plainText);

//     // console.log(hashed.toString());

//     const encrypted = cryptoJS.AES.encrypt(plainText, key);

//     console.log(`Encrypted: ${encrypted}`);
//     console.log(`IV: ${encrypted.key}`);

//     // const decrypted = cryptoJS.AES.decrypt(encrypted, key);

//     // console.log(encrypted);

//     // console.log(encrypted.ciphertext.toString());

// }

// test();

// const test2 = () => {

//     const password = "lols123";

//     const encrypted = cryptoJS.SHA1(password);

//     console.log(encrypted);

// }

// test2();

const dateTest = () => {

    // let date = new Date();

    // console.log(date);
    // console.log(date.getDay());

    let date = "2023-06-04";
    let time = "12:45"

    let dateTime = date + " " + time;

    console.log(dateTime);
    console.log(`${date} ${time}`);

    let hour = "08";
    console.log(hour);

    console.log(time.length);

}

dateTest();