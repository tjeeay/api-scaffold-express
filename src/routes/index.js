function setup(app) {
  app.get('/', (req, res) => {
    res.type('txt').send('Hello World!');
  });

  app.get('/500', (req, res) => {
    res.send('should throw an error');
    throw new Error('I am a error.');
  });
}

export default setup;
