import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

const TOUR_STORAGE_KEY = 'sentinel_tour_completed';
const TOUR_RESET_DAYS = 20; // Tour reaparece a cada 20 dias

export function useTourStatus(user: User | null) {
  const [runTour, setRunTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Verificar se o usuário já viu o tour e quando foi
    const tourCompletedData = localStorage.getItem(TOUR_STORAGE_KEY);
    
    if (!tourCompletedData) {
      // Primeira vez - mostrar tour
      const timer = setTimeout(() => {
        setRunTour(true);
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Verificar se passaram 20 dias desde a última vez
      try {
        const completedTimestamp = parseInt(tourCompletedData);
        const daysSinceCompleted = (Date.now() - completedTimestamp) / (1000 * 60 * 60 * 24);
        
        if (daysSinceCompleted >= TOUR_RESET_DAYS) {
          // Passaram 20 dias - mostrar tour novamente
          const timer = setTimeout(() => {
            setRunTour(true);
            setIsLoading(false);
          }, 1000);
          
          return () => clearTimeout(timer);
        } else {
          // Ainda não passaram 20 dias
          setIsLoading(false);
        }
      } catch (error) {
        // Se houver erro ao parsear, tratar como primeira vez
        console.error('Erro ao verificar status do tour:', error);
        setIsLoading(false);
      }
    }
  }, [user]);

  const completeTour = () => {
    // Salvar timestamp atual (em ms)
    localStorage.setItem(TOUR_STORAGE_KEY, Date.now().toString());
    setRunTour(false);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setRunTour(true);
  };

  return {
    runTour,
    setRunTour,
    completeTour,
    resetTour,
    isLoading
  };
}
