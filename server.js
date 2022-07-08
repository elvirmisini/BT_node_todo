const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const db = require('./config/keys').mongoUri;
const users = require('./routes/users');
const profile = require('./routes/profile');
const posts = require('./routes/posts');

mongoose
	.connect(db)
	.then(() => console.log('MongoDb connected'))
	.catch((err) => console.log(`Err ${err}`));

const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(passport.initialize());
require('./config/passport')(passport)


app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

app.get('/', (req, res) => {
	res.send('Hello World!');
});

const port = process.env.PORT | 3030;
app.listen(port, () => console.log(`Server running on port ${port}`))
