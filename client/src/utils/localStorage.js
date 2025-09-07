export const setLocalStorage = (key, data) => {
  const jsonString = JSON.stringify(data);
  localStorage.setItem(key, jsonString);
};

export const getLocalStorageData = (key) => {
  const jsonString = localStorage.getItem(key);
  if (!jsonString) {
    return null;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return null;
  }
};

export const resetLocalStorageData = (key) => {
  localStorage.removeItem(key);
};
