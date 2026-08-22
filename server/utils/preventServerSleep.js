import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

const makeRequestToServer = async (SERVER_BASE_URL, limit) => {
  for (let i = 0; i < limit; i++) {
    try {
      const res = await axios.get(SERVER_BASE_URL);
      console.log(`Ping Success: ${SERVER_BASE_URL} (Status: ${res.status})`);
      return; // Success, exit function
    } catch (err) {
      console.error(`Ping Failed: ${SERVER_BASE_URL} (Attempt ${i + 1}/${limit}) - ${err?.response?.status || err.message}`);
      if (i < limit - 1) {
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
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
