import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function useBeamsMessages() {
  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      if (
        ev.data?.type === 'BEAMS_NOTIFICATION_RECEIVED' &&
        ev.data.payload?.web?.notification
      ) {
        const { title, body } = ev.data.payload.web.notification;
        toast.info(`${title}\n${body}`, {
          autoClose: 5000,
        });
      }
    }

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, []);
}
