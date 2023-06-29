const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Verbindung zur SQLite-Datenbank herstellen
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Verbindung zur SQLite erfolgreich hergestellt');
  }
});

app.use(express.json());

const port = 3000;
const hostname = 'localhost';

//Auflistung aller DB Einträge
app.get('/restaurants', (_, res) => {
    const query = "SELECT*FROM restaurants";
    db.all(query, (err, rows) => {
        if (err){
            res.status(500);
            res.send("Daten konnten nicht abgerufen werden.")
        }else {
            res.send(rows);
        }
    })
});

//Bestimmtes Restaurant suchen
app.get('/restaurant/:name', (req, res) => {
    const query = "SELECT*FROM restaurants WHERE name=?";
    db.get(query, [req.params.name], (err, row) => {
        if (err){
            res.status(500);
            res.send("Daten konnten nicht abgerufen werden.")
        }else if (row){
            res.send(row);
        }else {
            res.status(404);
            res.send("Eintrag nicht vorhanden.")
        }
    })
});

//Neuen DB Restaurant Eintrag erzeugen
app.post('/restaurant', (req, res) => {
    const r = req.body;
    if (!r.name || !r.adresse || !r.kategorie) {
            res.status(400);
            res.send("Objekt ist nicht vollständig.");
        } else {
            const query = "INSERT INTO restaurants (name, adresse, kategorie) VALUES (?, ?, ?)";
            db.run(query, [r.name, r.adresse, r.kategorie], function(err){
                if(err){
                    res.status(500);
                    res.send("Fehler beim hinzufügen des Restaurants zur Datenbank.")
                 } else {
            res.status(201);
            res.send("Restaurant wurde hinzugefügt")
        }
    })
}});

//Aktualisieren der Daten in der DB für bestimmtes Restaurant
app.put('/restaurant/:name', (req, res) => {
    const r = req.body;
    if (r.name && r.adresse && r.kategorie) {
        const query = "UPDATE restaurants SET name=?, adresse=?, kategorie=? WHERE name=?";
        db.run(query, [r.name, r.adresse, r.kategorie, req.params.name], function(err){
            if(err){
                res.status(500);
                res.send("Fehler beim aktualisieren der Datenbank.")
                } else if (this.changes === 0){
                    res.status(404);
                    res.send("Restaurante nicht gefunden.")
                }
                 else {
                    res.send(r);
                    console.log(`Aktualisiere: ${req.params.name}: ${r.name}, ${r.adresse}, ${r.kategorie}`)
        }
    });
} else {
    res.status(400);
    res.send("Daten unvollständig. Wurde nicht aktualisiert.")
}});

//Löschen eines DB Eintrages
app.delete('/restaurant/:name', (req, res) => {
        const query = "DELETE FROM restaurants WHERE name=?";
        db.run(query, [req.params.name], function(err){
            if(err){
                res.status(500);
                res.send("Fehler beim Löschen des Eintrags aus der Datenbank.")
                } else if (this.changes === 0){
                    res.status(404);
                    res.send("Restaurante nicht gefunden.")
                }
                 else {
                    res.send(`Folgender Eintrag wurde entfernt: ${req.params.name}`);
        }
    });
});

//Server starten
app.listen(port, hostname, () => {
    console.log(`Server gestartet ${hostname}:${port}.`)
});

//verbindung trennen
process.on('SIGINT', () => {
    console.log("Database connection closed.");
    db.close();
    process.exit();
})