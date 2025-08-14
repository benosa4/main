import { Smile, Clock3, PawPrint, Utensils, Car, Volleyball, Flag, CaseSensitive } from 'lucide-react';
import { JSX } from 'react';

export const categoryIcons: Record<string, JSX.Element> = {
  recent: <Clock3 size={18} />,
  smileys_and_emotions: <Smile size={18} />,
  people: <Smile size={18} />,
  animals_and_nature: <PawPrint size={18} />,
  food_and_drink: <Utensils size={18} />,
  travel_and_places: <Car size={18} />,
  activities_and_events: <Volleyball size={18} />,
  objects: <CaseSensitive size={18} />,
  symbols: <CaseSensitive size={18} />,
  flags: <Flag size={18} />,
};
