import React from "react";

const getFromLocalStorage = <T>(key: string) => {
  const value = window.localStorage.getItem(key);
  if (value) {
    return JSON.parse(value) as T;
  }
  return null;
};

const setToLocalStorage = <T>(key: string, value: T) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    const item = getFromLocalStorage<T>(key);
    return item ?? initialValue;
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    setToLocalStorage(key, valueToStore);
  };

  return [storedValue, setValue] as const;
};

export default useLocalStorage;
