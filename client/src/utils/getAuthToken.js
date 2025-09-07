import { getLocalStorageData } from './localStorage.js';

const getAuthToken = () => {
  const token = getLocalStorageData('token');
  return token;
};

export default getAuthToken;
