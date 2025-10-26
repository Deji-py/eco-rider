// services/phoneMFAService.ts (Latest Supabase Docs 2024)
import { supabase } from '@/utils/supabase';

export interface MFAResponse {
  success: boolean;
  message?: string;
  error?: string;
  factorId?: string;
  challengeId?: string;
}

// 1. Enroll phone for MFA - Creates unverified factor
export const enrollPhoneMFA = async (phoneNumber: string): Promise<MFAResponse> => {
  try {
    const formattedPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+234${phoneNumber.slice(-10)}`;

    console.log('Enrolling phone for MFA:', formattedPhone);

    // Enroll creates a new unverified factor
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'phone',
      phone: formattedPhone,
      friendlyName: 'My Phone',
    });

    if (error) {
      console.error('Enroll MFA error:', error);
      return {
        success: false,
        error: error.message || 'Failed to enroll phone',
      };
    }

    console.log('Phone enrolled successfully. Factor ID:', data?.id);

    return {
      success: true,
      message: 'Phone enrolled. Send OTP to verify.',
      factorId: data?.id,
    };
  } catch (error: any) {
    console.error('Enroll MFA exception:', error);
    return {
      success: false,
      error: error.message || 'Failed to enroll phone',
    };
  }
};

// 2. Send OTP - Creates a challenge that sends SMS
export const sendPhoneMFAOTP = async (factorId: string): Promise<MFAResponse> => {
  try {
    console.log('Sending MFA OTP for factor:', factorId);

    // Challenge automatically sends SMS for phone factors
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId: factorId,
    });

    if (error) {
      console.error('Challenge error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send OTP',
      };
    }

    console.log('Challenge created. Challenge ID:', data?.id);

    return {
      success: true,
      message: 'OTP sent to your phone',
      challengeId: data?.id,
    };
  } catch (error: any) {
    console.error('Send OTP exception:', error);
    return {
      success: false,
      error: error.message || 'Failed to send OTP',
    };
  }
};

// 3. Verify OTP - Verifies challenge code
export const verifyPhoneMFAOTP = async (
  factorId: string,
  challengeId: string,
  code: string
): Promise<MFAResponse> => {
  try {
    console.log('Verifying MFA OTP');

    // Verify the challenge with the code user entered
    const { data, error } = await supabase.auth.mfa.verify({
      factorId: factorId,
      challengeId: challengeId,
      code: code,
    });

    if (error) {
      console.error('Verify error:', error);
      return {
        success: false,
        error: error.message || 'Invalid OTP',
      };
    }

    console.log('OTP verified successfully');

    return {
      success: true,
      message: 'Phone verified successfully! AAL upgraded to aal2.',
    };
  } catch (error: any) {
    console.error('Verify OTP exception:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify OTP',
    };
  }
};

// 4. Get Authenticator Assurance Level
export const getAAL = async () => {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (error) {
      console.error('Get AAL error:', error);
      return null;
    }

    console.log('AAL info:', data);
    return data;
  } catch (error: any) {
    console.error('Get AAL exception:', error);
    return null;
  }
};

// 5. List enrolled MFA factors
export const listMFAFactors = async () => {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      console.error('List factors error:', error);
      return [];
    }

    return data?.all || [];
  } catch (error: any) {
    console.error('List factors exception:', error);
    return [];
  }
};

// 6. Find phone factor
export const getPhoneFactor = async () => {
  try {
    const factors = await listMFAFactors();
    const phoneFactor = factors.find((f) => f.factor_type === 'phone');
    return phoneFactor;
  } catch (error: any) {
    console.error('Get phone factor error:', error);
    return null;
  }
};

// 7. Unenroll a factor (for testing/cleanup)
export const unenrollFactor = async (factorId: string) => {
  try {
    const { error } = await supabase.auth.mfa.unenroll({
      factorId: factorId,
    });

    if (error) {
      console.error('Unenroll error:', error);
      return false;
    }

    console.log('Factor unenrolled');
    return true;
  } catch (error: any) {
    console.error('Unenroll exception:', error);
    return false;
  }
};
