const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
console.log('dirname: ' + __dirname)
app.use(express.static(path.join(__dirname, 'build')));


// MySQL configuration  

const connection = mysql.createConnection({
  host: 'us-cdbr-east-06.cleardb.net',
  user: 'bcbe4cc26f9210',
  password: '545df820',
  database: 'heroku_59ca7044a5a301e',
}); 
/*
// Local Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'FANTASY_FOOTBALL',
}); 
*/

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});
/*
app.get("/", (req, res) => {
  res.send("Hello nerd");
});
*/

app.get('/playerData/', (req, res) => {

    const { playerName, position } = req.query

    let query = 'SELECT * FROM player_rankings';

    const queryParams = [];

    if(position) {
        query += ' WHERE position = ? AND PosRank2022 IS NOT NULL';
        queryParams.push(position);
    }

    query += ' ORDER BY CAST(SUBSTRING(PosRank2022, 3) AS UNSIGNED) LIMIT 20';

    connection.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).send('Error fetching data');
      } else {
        const allData = results;
        res.json(allData);
      }
    });
  });

app.get('/suggestions/:value', (req, res) => {
    const value = req.params.value;
    const query = `SELECT DISTINCT player_name FROM total_stats WHERE player_name LIKE ? LIMIT 5`
    const valueParam = `%${value}%`;

    connection.query(query, [valueParam], (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          res.status(500).send('Error fetching suggestions');
        } else {
          const suggestions = results.map(row => row.player_name);
          res.json(suggestions);
        }
    });
});

app.get('/playerData/:playerName', (req, res) => {
    const playerName = req.params.playerName;
  
    // Query database to fetch player data based on the player name
    const query = 'SELECT * FROM total_stats WHERE player_name = ? ORDER BY YEAR DESC';
  
    connection.query(query, [playerName], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).send('Error fetching player data');
      } else {
        const playerData = results;
        res.json(playerData);
      }
    });
  });

  app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, 'Frontend', 'ff', 'build', 'index.html'));
   });
 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


