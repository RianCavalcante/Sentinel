import React from 'react';
import Joyride, { CallBackProps, STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { tourSteps, tourLocale } from '../config/tourSteps';

interface OnboardingTourProps {
  run: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ run, onComplete }: OnboardingTourProps) {
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, type } = data;

    // Finalizar tour se completado ou pulado
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onComplete();
    }

    // Log para debug (opcional)
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      console.log('Tour event:', { status, action, type });
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableOverlayClose
      spotlightClicks
      callback={handleJoyrideCallback}
      locale={tourLocale}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          textColor: '#e4e4e7',
          backgroundColor: '#18181b',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          arrowColor: '#18181b',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '16px',
          padding: 0,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 600,
          color: '#e4e4e7',
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: 0,
        },
        tooltipContent: {
          padding: '16px 24px 20px',
          fontSize: '14px',
          lineHeight: 1.6,
          color: '#a1a1aa',
        },
        tooltipFooter: {
          padding: '16px 24px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          marginTop: 0,
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 500,
          outline: 'none',
          border: 'none',
        },
        buttonBack: {
          color: '#a1a1aa',
          marginRight: '12px',
          fontSize: '14px',
          fontWeight: 500,
        },
        buttonSkip: {
          color: '#71717a',
          fontSize: '14px',
          fontWeight: 500,
        },
        beacon: {
          display: 'none', // Remover beacon inicial para começar direto
        },
        spotlight: {
          borderRadius: '12px',
          border: '2px solid rgba(59, 130, 246, 0.5)',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        },
      }}
    />
  );
}
