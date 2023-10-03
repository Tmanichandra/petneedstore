const mongoose = require('mongoose');
const express = require('express');
const readLine = require('readline');

const app = express();
const PORT = process.env.PORT || 3000;

let dbURL = 'mongodb://127.0.0.1/PetNeeds';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected Online: ${conn.connection.host}`);
    } catch (error) {
        console.log('Error: ' + error);
        process.exit(1);
    }
};

const connect = () => {
    setTimeout(() => mongoose.connect(dbURL), 1000);
    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to ' + dbURL);
    });
};

mongoose.connection.on('error', err => {
    console.log('Error: ' + err);
    return connect();
});

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected');
});

if (process.platform === 'win32') {
    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('SIGINT', () => {
        process.emit("SIGINT");
    });
}

async function gracefulShutdown(msg) {
    const closed = await mongoose.connection.close()
        .then(function () {
            console.log(`Mongoose disconnected through ${msg}`);
            process.exit();
        });
};

process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});
process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});
process.on('SIGTERM', () => {
    gracefulShutdown('Cyclic app shutdown', () => {
        process.exit(0);
    });
});

if (process.env.NODE_ENV === 'production')
    connectDB();
else
    connect();

require('./products');