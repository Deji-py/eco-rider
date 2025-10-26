// hooks/usePhoneVerification.ts (Latest Supabase MFA API)
import { useState, useEffect, useCallback } from 'react';
import {
  enrollPhoneMFA,
  sendPhoneMFAOTP,
  verifyPhoneMFAOTP,
  getPhoneFactor,
  getAAL,
} from '@/services/phoneMFAService';

const RESEND_TIMEOUT = 60; // 60 seconds

interface UsePhoneVerificationReturn {
  isVerified: boolean;
  isEnrolling: boolean;
  isSendingOTP: boolean;
  isVerifyingOTP: boolean;
  timeRemaining: number;
  canResend: boolean;
  enrollPhoneHandler: (phoneNumber: string) => Promise<boolean>;
  sendOTPHandler: () => Promise<boolean>;
  verifyOTPHandler: (code: string) => Promise<boolean>;
  checkVerificationStatus: () => Promise<boolean>;
  resetVerification: () => void;
  error: string | null;
}

export const usePhoneVerification = (): UsePhoneVerificationReturn => {
  const [isVerified, setIsVerified] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const canResend = timeRemaining === 0 && !isVerified;

  // 1. Enroll phone number
  const enrollPhoneHandler = useCallback(async (phoneNumber: string): Promise<boolean> => {
    setIsEnrolling(true);
    setError(null);

    try {
      const result = await enrollPhoneMFA(phoneNumber);

      if (!result.success) {
        setError(result.error || 'Failed to enroll phone');
        setIsEnrolling(false);
        return false;
      }

      // Store factor ID for later
      if (result.factorId) {
        setFactorId(result.factorId);
      }

      setIsEnrolling(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsEnrolling(false);
      return false;
    }
  }, []);

  // 2. Send OTP
  const sendOTPHandler = useCallback(async (): Promise<boolean> => {
    if (!factorId) {
      setError('Phone not enrolled. Please enroll first.');
      return false;
    }

    setIsSendingOTP(true);
    setError(null);

    try {
      const result = await sendPhoneMFAOTP(factorId);

      if (!result.success) {
        setError(result.error || 'Failed to send OTP');
        setIsSendingOTP(false);
        return false;
      }

      // Store challenge ID
      if (result.challengeId) {
        setChallengeId(result.challengeId);
      }

      setTimeRemaining(RESEND_TIMEOUT);
      setIsSendingOTP(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsSendingOTP(false);
      return false;
    }
  }, [factorId]);

  // 3. Verify OTP
  const verifyOTPHandler = useCallback(
    async (code: string): Promise<boolean> => {
      if (!factorId || !challengeId) {
        setError('No active challenge. Please send OTP first.');
        return false;
      }

      setIsVerifyingOTP(true);
      setError(null);

      try {
        const result = await verifyPhoneMFAOTP(factorId, challengeId, code);

        if (!result.success) {
          setError(result.error || 'Invalid OTP');
          setIsVerifyingOTP(false);
          return false;
        }

        setIsVerified(true);
        setTimeRemaining(0);
        setIsVerifyingOTP(false);
        return true;
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        setIsVerifyingOTP(false);
        return false;
      }
    },
    [factorId, challengeId]
  );

  // 4. Check verification status (AAL)
  const checkVerificationStatus = useCallback(async (): Promise<boolean> => {
    try {
      const aal = await getAAL();

      if (aal?.currentLevel === 'aal2') {
        setIsVerified(true);
        return true;
      }

      // Also check if phone factor exists
      const phoneFactor = await getPhoneFactor();
      if (phoneFactor) {
        setFactorId(phoneFactor.id);
        setIsVerified(phoneFactor.status === 'verified');
        return phoneFactor.status === 'verified';
      }

      return false;
    } catch (err: any) {
      console.error('Check verification error:', err);
      return false;
    }
  }, []);

  const resetVerification = useCallback(() => {
    setIsVerified(false);
    setTimeRemaining(0);
    setError(null);
    setFactorId(null);
    setChallengeId(null);
  }, []);

  return {
    isVerified,
    isEnrolling,
    isSendingOTP,
    isVerifyingOTP,
    timeRemaining,
    canResend,
    enrollPhoneHandler,
    sendOTPHandler,
    verifyOTPHandler,
    checkVerificationStatus,
    resetVerification,
    error,
  };
};
