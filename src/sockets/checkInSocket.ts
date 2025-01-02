import { Server } from 'socket.io';
import { startCheckInStream } from '@/streams/checkInStream';

export default function setupCheckInWebSocket(server: any) {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Client connected for real-time Check-In updates.');

    startCheckInStream((event) => {
      socket.emit('checkInUpdate', event);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected.');
    });
  });
}
