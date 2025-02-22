import express from 'express';
import KiRouter from './routes/ki/KiRouter';

const app = express();
app.use('/ki', KiRouter());
