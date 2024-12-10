//import packages
const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_db');
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));
app.post('/api/notes',async (req,res,next) => {
    try {
        const SQL =`
        INSERT INTO notes(txt) VALUES($1) RETURNING *`;
        const response = await client.query(SQL,[req.body.txt]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});
app.get('/api/notes',async (req,res,next) => {
    try {
        const SQL =`SELECT * from notes ORDER BY created_at DESC;`;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});
app.put('/api/notes/:id',async (req,res,next) => {
    try {
        const SQL =`
        UPDATE notes 
        SET txt=$1, ranking=$2,updated_at=now()
        where id=$3 RETURNING *`;
        const response = await client.query(SQL,[req.body.txt,req.body.ranking,req.params.id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});
app.delete('/api/notes/:id',async (req,res,next) => {
    try {
        const SQL =`
        DELETE FROM notes
        WHERE id=$1`;
        const response = await client.query(SQL,[req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});
const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = `
    DROP TABLE IF EXISTS NOTES;
    CREATE TABLE notes(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ranking INTEGER DEFAULT 3 NOT NULL,
    txt varchar(255) NOT NULL);
    `;
    await client.query(SQL);
    console.log('Tables created');
    SQL = `
    INSERT INTO notes(txt, ranking) VALUES('learn express', 5);
    INSERT INTO notes(txt, ranking) VALUES('write SQL queries', 4);
    INSERT INTO notes(txt, ranking) VALUES('create routes', 2);
    `;
    await client.query(SQL);
    console.log('Data seeded');
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
};

init();

