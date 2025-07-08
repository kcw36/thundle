// src/components/ApiKeepAlive.tsx
import { useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_THUNDLE_API ?? '';
const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes

const ApiKeepAlive = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const keepAlive = () => {
      axios.get(API_BASE).catch((err) => {
        console.error('API keep-alive failed:', err);
      });
    };

    const intervalId = setInterval(keepAlive, KEEP_ALIVE_INTERVAL);

    // Initial ping
    keepAlive();

    return () => clearInterval(intervalId);
  }, []);

  return <>{children}</>;
};

export default ApiKeepAlive;
