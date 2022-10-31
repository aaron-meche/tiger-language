// function main() {
//     console.log('Welcome to the tigerDB testing center.\n\n\n');
// }

// let db = 'http://192.168.1.18:9900';

// function testing() {
//     console.log('val', readDB(db, 'password', 'root'));
// }

let db = {
    l1_1: 'this',
    l1_2: {
        l2_1: 'hi',
        l2_2: 'crazy',
    }
}

console.log(toJsonPath('db'));
console.log(toJsonPath('db/user/password'));

function toJsonPath(path) {
    let split = path.split('/');
    let JsonPath = split[0];
    for (let i = 1; i < split.length; i++) {
        let insert = `["${split[i]}"]`;
        JsonPath += insert;
    }
    return JsonPath;
}

console.log(eval('db["l1_2"]["l2_2"]'));