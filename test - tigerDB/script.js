function main() {
    console.log('Welcome to the tigerDB testing center.\n\n\n');
}

let db = 'http://192.168.1.18:9900';

function testing() {
    console.log('val', readDB(db, 'password', 'root'));
}