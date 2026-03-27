import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createAuthRouter } from './auth-routes.js';

const PORT = Number(process.env.PORT) || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_ACCESS_SECRET || JWT_ACCESS_SECRET.length < 32) {
  console.error('Set JWT_ACCESS_SECRET (min 32 chars) in server/.env');
  process.exit(1);
}
if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
  console.error('Set JWT_REFRESH_SECRET (min 32 chars) in server/.env');
  process.exit(1);
}

const accessMinutes = Math.max(1, Number(process.env.ACCESS_TOKEN_MINUTES) || 15);
const refreshDays = Math.max(1, Number(process.env.REFRESH_TOKEN_DAYS) || 7);

const tokenConfig = {
  accessSecret: JWT_ACCESS_SECRET,
  refreshSecret: JWT_REFRESH_SECRET,
  accessMinutes,
  refreshDays,
};

const app = express();
app.set('trust proxy', 1);
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', createAuthRouter(tokenConfig, CLIENT_ORIGIN));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`CORS origin: ${CLIENT_ORIGIN}`);
});
