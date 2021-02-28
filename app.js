// Require modules
const express = require('express');
const app = express();
const path = require('path');

//EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

//Basic routing
app.get('/', (req, res) => {
	res.render('home');
});

//Server
app.listen(3000, () => {
	console.log('Listening on port 3000');
});
