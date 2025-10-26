import { useEffect } from 'react';
import useProfile from './useProfile';
import useProfileStore from '../store/profile.store';

/**
 * useProfileSync - Bridge hook that syncs React Query data to Zustand store
 *
 * This hook should be used once at the app root level to keep the Zustand store
 * in sync with React Query data fetched by useProfile hook.
 *
 * @example
 * // In your root layout or App component
 * function App() {
 *   useProfileSync();
 *   return <YourApp />;
 * }
 */
const useProfileSync = () => {
  const { profile, isLoading } = useProfile();
  const { setProfile, clearProfile } = useProfileStore();

  useEffect(() => {
    // Only sync when profile data is loaded and available
    if (!isLoading && profile) {
      setProfile(profile);
    }
  }, [profile, isLoading, setProfile]);

  // Clear store when profile is no longer available (logout)
  useEffect(() => {
    if (!isLoading && !profile) {
      clearProfile();
    }
  }, [profile, isLoading, clearProfile]);
};

export default useProfileSync;
