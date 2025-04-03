import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ConsultationError, isConsultationError } from '@/types/errors';

interface User {
  _id: string;
  token: string;
}

interface ConsultationState {
  isActive: boolean;
  consultationId: string | null;
  remainingBalance: number;
  duration: number;
  ratePerMinute: number;
}

export function useConsultation(astrologerId: string, type: 'chat' | 'call') {
  const { user, getToken } = useAuth();
  const [state, setState] = useState<ConsultationState>({
    isActive: false,
    consultationId: null,
    remainingBalance: 0,
    duration: 0,
    ratePerMinute: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch initial user balance and astrologer rate
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const token = localStorage.getItem('token');
        const [balanceResponse, astrologerResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/balance`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/astrologers/${astrologerId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        const [balanceData, astrologerData] = await Promise.all([
          balanceResponse.json(),
          astrologerResponse.json()
        ]);

        if (!astrologerData.success) {
          throw new Error(astrologerData.error || 'Failed to fetch astrologer');
        }

        setState(prev => ({ 
          ...prev, 
          remainingBalance: balanceData.balance,
          ratePerMinute: astrologerData.astrologer.price?.discounted || 0
        }));
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to fetch initial data');
      }
    }

    if (user?._id) {
      fetchInitialData();
    }
  }, [user?._id, astrologerId]);

  // Start consultation
  const startConsultation = useCallback(async () => {
    try {
      // Check balance before making API call
      if (state.remainingBalance < state.ratePerMinute * 5) {
        const error = new Error('Insufficient balance') as ConsultationError;
        error.code = 'INSUFFICIENT_BALANCE';
        error.details = {
          required: state.ratePerMinute * 5,
          current: state.remainingBalance,
          shortfall: (state.ratePerMinute * 5) - state.remainingBalance
        };
        throw error;
      }

      const token = getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/consultations/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          astrologerId,
          type
        })
      });

      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.error || 'Failed to start consultation') as ConsultationError;
        if (data.details) {
          error.code = data.code;
          error.details = data.details;
        }
        throw error;
      }

      setState(prev => ({
        ...prev,
        isActive: true,
        consultationId: data.consultation._id,
        ratePerMinute: data.consultation.ratePerMinute,
        remainingBalance: prev.remainingBalance - data.consultation.totalAmount
      }));

      return data.consultation;
    } catch (error) {
      console.error('Error starting consultation:', error);
      if (isConsultationError(error)) {
        setError(error.message);
        throw error;
      }
      setError('Failed to start consultation');
      throw new Error('Failed to start consultation');
    }
  }, [astrologerId, type, getToken, state.remainingBalance, state.ratePerMinute]);

  // Extend consultation
  const extendConsultation = useCallback(async () => {
    if (!state.consultationId) return;

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/consultations/extend/${state.consultationId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to extend consultation');
      }

      setState(prev => ({
        ...prev,
        remainingBalance: data.newBalance,
        duration: prev.duration + 5
      }));

      return data;
    } catch (error) {
      console.error('Error extending consultation:', error);
      setError(error instanceof Error ? error.message : 'Failed to extend consultation');
      throw error;
    }
  }, [state.consultationId, getToken]);

  // End consultation
  const endConsultation = useCallback(async () => {
    if (!state.consultationId) return;

    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/consultations/end/${state.consultationId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to end consultation');
      }

      setState(prev => ({
        ...prev,
        isActive: false,
        consultationId: null
      }));

      return data;
    } catch (error) {
      console.error('Error ending consultation:', error);
      setError(error instanceof Error ? error.message : 'Failed to end consultation');
      throw error;
    }
  }, [state.consultationId, getToken]);

  return {
    ...state,
    error,
    startConsultation,
    extendConsultation,
    endConsultation
  };
} 