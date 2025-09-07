import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

const makeRequestToServer = (SERVER_BASE_URL, limit) => {
  axios
    .get(SERVER_BASE_URL)
    .then((res) => console.log('Ping Success:', SERVER_BASE_URL, res.status))
    .catch((err) => {
      console.error('Ping Failed:', SERVER_BASE_URL, err?.response?.status || err.message);

      // Try again if attempts left 
      if (limit > 0) {
        makeRequestToServer(SERVER_BASE_URL, limit - 1);
      }
    });
};

const preventServerSleep = () => {
  console.log('⏰ Prevent Sleep Task Scheduled');

  const SERVER_BASE_URL = process.env.SERVER_BASE_URL;
  const FRIEND_SERVER = process.env.FRIEND_SERVER;

  if (!SERVER_BASE_URL) {
    throw new Error('❌ SERVER_BASE_URL is not defined in .env');
  }

  // Every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    console.log('🔁 Sending keep-alive pings...');
    makeRequestToServer(SERVER_BASE_URL, 3);
    if (FRIEND_SERVER) {
      makeRequestToServer(FRIEND_SERVER, 3);
    }
  });
};

export default preventServerSleep;
