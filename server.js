import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';

import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import creditRoutes from './routes/creditRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/credits', creditRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
    console.log(
        `App listening in ${process.env.NODE_ENV} mode on port ${process.env.PORT}!`
            .yellow.bold
    );
});
