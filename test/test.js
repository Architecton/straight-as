var zahteva = require('supertest');
var streznik = require('../src/streznik.js');


describe('Začetna stran', function() {
    it ('Naslov strani: "Bogdej..."', function(done) {
        zahteva(streznik).get('/').expect(/<h1>Bogdej, Janez<\/h1>/i, done);
    });

    it ('Odstavek "brskalnik"', function(done) {
        zahteva(streznik).get('/').expect(/<p>Mislš da jst ne vem, da si se prpelu z <\/p>/i, done);
    });
});
