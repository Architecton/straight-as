var express = require('express');
var streznik = express();
var port = process.env.PORT || 3000;


/**
 * Ko uporabnik obišče začetno stran,
 * izpiši začetni pozdrav
 */
streznik.get('/', function (zahteva, odgovor) {
    odgovor.send(
        '<h1>Bogdej, Janez</h1>' +
        '<p>Mislš da jst ne vem, da si se prpelu s </p>' +
        '<pre>' + zahteva.get('User-Agent') + '</pre>'
    );
});


/**
 * Poženi strežnik
 */
streznik.listen(port, function () {
    console.log('Strežnik je pognan na odprtini ' + port + ' ajga.');
});


module.exports = streznik;
