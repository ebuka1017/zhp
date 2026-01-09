import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: [config.urls.webDashboard, 'http://localhost:3000', 'http://localhost:19006'],
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
});

export default app;
