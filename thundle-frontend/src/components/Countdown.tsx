import { useState, useEffect } from 'react';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      // Get current time components in Frankfurt/Berlin timezone
      const nowInBerlinStr = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23', // Use 24-hour format
      });

      const [hours, minutes, seconds] = nowInBerlinStr.split(':').map(Number);

      // Calculate total seconds remaining in the day
      const secondsPassed = hours * 3600 + minutes * 60 + seconds;
      const totalSecondsInDay = 24 * 3600;
      const secondsRemaining = (totalSecondsInDay - secondsPassed) % totalSecondsInDay;

      // Format remaining time
      const h = Math.floor(secondsRemaining / 3600);
      const m = Math.floor((secondsRemaining % 3600) / 60);
      const s = secondsRemaining % 60;

      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m
          .toString()
          .padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <h2 className="text-2xl mb-2">New vehicles in:</h2>
      <p className="text-4xl font-bold">{timeLeft}</p>
    </div>
  );
};

export default Countdown;
