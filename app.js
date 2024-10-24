const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv/config');

const app = express();
const env = process.env;
const API = env.API_URL;


app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());


const authRouter = require('./routes/auth');


app.use(`${API}/`, authRouter);





//Start the server
const hostname = env.HOST;
const port = env.PORT;

mongoose.connect(env.MONGODB_CONNECTION_STRING).then(() => {
    console.log('Connected to Database');
}).catch((error) => {
    console.error(error);
});



console.info('hostname is ', hostname);

app.listen(port, hostname, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});





