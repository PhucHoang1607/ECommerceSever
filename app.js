const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv/config');
const authJwt = require('./middleware/jwt');
const errorHandler = require('./middleware/error_handler');

const app = express();
const env = process.env;
const API = env.API_URL;


app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());
app.use(authJwt());
app.use(errorHandler);


const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const adminRouter = require('./routes/admin');


app.use(`${API}/`, authRouter);
app.use(`${API}/users`, userRouter);
app.use(`${API}/admin`, adminRouter);
app.use(`/public`, express.static(__dirname + '/public'));





//Start the server
const hostname = env.HOST;
const port = env.PORT;
require('./helper/cron_job');

mongoose.connect(env.MONGODB_CONNECTION_STRING).then(() => {
    console.log('Connected to Database');
}).catch((error) => {
    console.error(error);
});



console.info('hostname is ', hostname);

app.listen(port, hostname, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});





