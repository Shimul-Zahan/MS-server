const express = require('express');
const mongoose = require('mongoose');
const manage = require('./Controller/manage');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const port = process.env.PORT || 8000;
app.use(express.static('public'));

app.use(cors());
app.use(express.json());
app.use('/', manage);

const connecting = () => {
    const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.waps95s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
    return uri;
}

const connectDB = async () => {
    console.log('testing.....');
    const test = connecting();
    await mongoose.connect(test, { dbName: 'MS_DB' })
    console.log('connected');
}

const final = async () => {
    await connectDB()
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

final()