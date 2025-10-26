import storage from '@/config/mmkv';
import useProfileStore from '@/features/profile/store/profile.store';

// check if user has onboarded

const hasOnBoarded = () => {
  return storage.getBoolean('onBoarded');
};

const setOnBoarded = () => {
  storage.set('onBoarded', true);
};

// Check if profile exists in storage
const hasStoredProfile = () => {
  const stored = storage.getString('dispatch_rider_profile');
  return !!stored;
};

// Get profile sync status
const getProfileTimestamp = () => {
  const profile = useProfileStore.getState().profile;
  return profile?.updated_at;
};

export { hasOnBoarded, setOnBoarded, hasStoredProfile, getProfileTimestamp };
