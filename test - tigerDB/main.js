function main() {
    console.log('Welcome to the tigerDB testing center.\n\n\n');
}

let db = 'http://192.168.1.18:9900';

function logIn() {
    if (matchDB(db, dom('loginInput_user').value + '/password', dom('loginInput_pass').value)) {
        console.log('LOGGED IN COMPLETE');
    } else {
        console.log(matchDB(db, dom('lognInput_user') + '/password', dom('loginInput_pass')));
    }
}

function signUp() {
    writeDB(db, dom('signupInput_user').value + '/password', 'userKEY', dom('signupInput_pass').value);
    console.log('signUp Complete');
    console.log(readDB(db, 'aaronmeche', 'bailey'));
}