console.log("hello world");

describe('administrator account', () => {
  describe('administrator account exists', () => {
    it('administrator account should have specified email', () => {
		chai.request(server)
		  .get('/users')
		  .end((err, res) => {

		  })
    });
    it('administrator account should have administrator property set to true', () => {

    });
  })
})
