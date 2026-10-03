import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import playerRoutes from './routes/playerRoutes.js';
import draftRoutes from './routes/draftRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import matchDetailsRoutes from './routes/matchDetailsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Bayern Draft Server',
    time: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/players', playerRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/next-match', matchRoutes);
app.use('/api/match', matchDetailsRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`⚽ Bayern Draft Server running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints: /api/players, /api/drafts`);
});
