import { io } from 'socket.io-client';


const URL = 'http://localhost:9860'

export function connectWebSocket()  {
 return io(URL, {
    withCredentials: true,  // ensure credentials if you use cookies
  });}