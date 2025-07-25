import express from 'express';
import cors from 'cors';
import path from 'path';
import accessRouter from './routes/access';
import registerRouter from './routes/register';
import endpointsRouter from './routes/endpoints';

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true
}));

app.use(express.json());

// Serve static circuit files
app.use('/circuits', express.static(path.join(__dirname, '../../../packages/zk-circuits/circuits')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/v1/access', accessRouter);
app.use('/v1/register', registerRouter);
app.use('/v1/endpoints', endpointsRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ZK Gateway running on port ${PORT}`);
});
