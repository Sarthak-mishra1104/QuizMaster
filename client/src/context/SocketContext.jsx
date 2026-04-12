/**
 * SocketContext - Manages Socket.io connection globally
 */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const socket = io(SOCKET_URL, {
      auth: { token, userId: user._id },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      reconnectionDelayMax: 2000,
      timeout: 10000,
      forceNew: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;
