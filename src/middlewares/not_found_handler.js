
export default function notFound(req, res) {
  res.status(404).format({
    html() {
      res.render('error_pages/404', { url: req.url });
    },
    json() {
      res.json({ error: 'Not Found' });
    },
    default() {
      res.type('txt').send('Not found');
    },
  });
}
