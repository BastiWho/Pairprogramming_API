const express = require('express');
const { element } = require('xml');
const app = express();

const port = 3000;
const hostname = 'localhost';

app.use(express.json());

let restaurants = [
    {
        name : "Bobs Burgers",
        adresse : "Zum Burgerladen 1, 12345 Burgerhausen",
        kategorie : "Burgerbude"
    },
    {
        name: "Testaurante",
        adresse: "Teststr. 1, 12345 Testhausen",
        kategorie: "Test"
    },
    {
        name: "Pizzeria Luigi",
        adresse: "Teststr. 1, 12345 Testhausen",
        kategorie: "Test"
    }
];

function getIndex(name) {
    let index = -1;
    for (let i=0 ; i<restaurants.length ; i++) {
        if (restaurants[i].name == name) {
            index = i;
        }
    }
    return index;
}

function delRestaurant(name) {
    const index = getIndex(name);
    let deleted = restaurants.splice(index,1);
    return deleted;
}

const exists = (name) => {
    let result = restaurants.find((elem) => {
        if (elem.name == name) {
            return true;
        }
    });
    if (result) {
        return true;
    } else {
        return false;
    }
}

app.get('/restaurants', (_, res) => {
    res.send(restaurants);
});

app.post('/restaurant', (req, res) => {
    let r = req.body;
    //Prüfe ob alle erforderlichen Daten vorhanden sind. 
    if (!r.name || !r.adresse || !r.kategorie){
        res.send("Objekt ist nicht vollständig! Mindestens eins der folgenden Dinge fehlt: Name, Adresse, Kategorie" );
    } else {
        let e = exists(r.name);
        if (!e) {
            restaurants.push(r);
            res.status(201);
            res.send("Restaurant wurde hinzugefügt.");
        } else {
            res.status(409);
            res.send("Restaurant ist bereits gespeichert.");
        }
    }
});

app.get('/restaurant/:name' , (req, res) => {
    // Variable für Suchergebnis anlegen (undefined)
    let result;
    //Suche nach Restaurant in Liste
    restaurants.forEach((elem) =>  {
        if (elem.name === req.params.name) {
            // Wenn Element in Liste gefunden, speichere in Variable Restaurnt
            result = elem;
        }
    });
    //Gib Ergebnis der Suche zurück
    if (result) {
        res.send(result);
    } else {
        res.status(404);
        res.send("Existiert nicht.");
    }
});

// * Restaurant aktualisieren mit löschen
app.put('/restaurant/:name', (req, res) => {
    if ( getIndex(req.params.name) != -1) {
        const r = req.body;
        if ( r.name && r.adresse && r.kategorie) {
            delRestaurant(r.name);
            restaurants.push(r);
            // TODO (löschen & neu einfügen?)
            res.send(r); // TODO neues Restaurant zurückgeben */
            console.log(`Aktualisiere: ${req.params.name}: ${r.name}, ${r.adresse}, ${r.kategorie}.`);
        } else {
            res.status(400);
            res.send("Daten unvollständig, nicht aktualisiert.");
        }
    } else {
        res.status(404);
        res.send("Restaurant nicht gefunden.")
    }
});

app.delete('/restaurant/:name', (req, res) => {
    if (getIndex(req.params.name) != -1) {
            let del = delRestaurant(req.params.name);
            res.send("Folgendes Restaurant wurde gelöscht: " + JSON.stringify(del));
    } else {
        res.status(404);
        res.send("Restaurant ist nicht vorhanden.");
    }
});

app.listen(port, hostname, () => {
    console.log(`Server gestartet ${hostname}:${port}.`)
});