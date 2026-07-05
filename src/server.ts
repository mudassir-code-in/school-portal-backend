import 'dotenv/config';
import { app } from './app.js'
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';   




connectDB();
connectRedis();




const port: Number = 3000;

app.listen(port, () => {
    console.log('Server is runnign on 3000 port');
});