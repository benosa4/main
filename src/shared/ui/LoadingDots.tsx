import { useEffect, useState } from 'react';

export const LoadingDots = () => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length < 3 ? d + '.' : ''));
    }, 500);
    return () => clearInterval(id);
  }, []);
  return <span>{dots}</span>;
};
