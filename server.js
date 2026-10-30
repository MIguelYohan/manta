import 'dotenv/config';
import app from './src/app.js';

const API_PORT = process.env.PORT || 3030;

app.listen(API_PORT, () => {
    console.log(`App running on port ${API_PORT}`);
});
