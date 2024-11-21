import express from 'express';

const app = express();
const port = process.env.VCR_PORT;

app.use(express.json());
app.use(express.static('public'));

app.get('/_/health', async (req, res) => {
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});