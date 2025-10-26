import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

interface DispatchRider {
  id: number;
  user_id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  distance_km: number;
  status: 'available' | 'busy' | 'offline';
  rating: number;
  completed_deliveries: number;
  local_gov_area: string;
  state: string;
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  riderProfile: DispatchRider | null;
  isLoading: boolean;
  isProfileComplete: boolean;
  pendingEmail: string | null; // Track email during signup flow
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [riderProfile, setRiderProfile] = useState<DispatchRider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // Fetch rider profile from database
  const fetchRiderProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('dispatch_riders')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // No rider profile found
        if (error.code === 'PGRST116') {
          console.log('No rider profile found for user:', userId);
          setRiderProfile(null);
          setIsProfileComplete(false);
          return false;
        }
        throw error;
      }

      setRiderProfile(data);
      setIsProfileComplete(true);
      return true;
    } catch (error) {
      console.error('Error fetching rider profile:', error);
      setRiderProfile(null);
      setIsProfileComplete(false);
      return false;
    }
  };

  useEffect(() => {
    // Check for existing session on app launch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchRiderProfile(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchRiderProfile(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setRiderProfile(null);
        setIsProfileComplete(false);
        setIsLoading(false);
      }
    });

    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Prevent auto-redirect
        },
      });

      if (error) throw error;

      // Store email for OTP verification
      setPendingEmail(email);

      Toast.show({
        type: 'success',
        text1: 'Verification code sent!',
        text2: 'Please check your email',
      });

      // Navigate to OTP verification
      setTimeout(() => {
        router.push('/verify-otp');
      }, 100);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Sign up failed',
        text2: 'Please try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // After successful sign in, check if rider profile exists
      if (data.session?.user) {
        const profileExists = await fetchRiderProfile(data.session.user.id);

        // If no profile, redirect to setup page
        if (!profileExists) {
          setTimeout(() => {
            router.replace('/(protected)/submit-profile');
          }, 100);
          return;
        }

        Toast.show({
          type: 'success',
          text1: 'Welcome back!',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Sign in failed',
        text2: 'Please try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'your-app-scheme://', // Replace with your app scheme
        },
      });

      if (error) throw error;

      // The OAuth flow will handle the rest
      // The onAuthStateChange listener will catch the session
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Google sign in failed',
        text2: 'Please try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setRiderProfile(null);
      setIsProfileComplete(false);
      setPendingEmail(null);

      router.replace('/');

      Toast.show({
        type: 'success',
        text1: 'You have been signed out.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Sign out failed',
        text2: 'Please try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app-scheme://reset-password', // Replace with your app scheme
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Reset link sent!',
        text2: 'Check your email for the password reset link.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Password reset failed',
        text2: 'Please try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Email verified!',
        text2: 'Your account has been activated.',
      });

      // Clear pending email
      setPendingEmail(null);

      // Check if profile exists
      if (data.session?.user) {
        const profileExists = await fetchRiderProfile(data.session.user.id);

        if (!profileExists) {
          setTimeout(() => {
            router.replace('/(protected)/submit-profile');
          }, 100);
        }
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Invalid OTP',
        text2: 'Please try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Code resent!',
        text2: 'Please check your email.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Failed to resend code',
        text2: 'Please try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Password updated!',
        text2: 'Your password has been changed successfully.',
      });

      // Navigate to login
      setTimeout(() => {
        router.replace('/');
      }, 100);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.message || 'Password update failed',
        text2: 'Please try again.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        riderProfile,
        isLoading,
        isProfileComplete,
        pendingEmail,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        verifyOTP,
        resendOTP,
        updatePassword,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
