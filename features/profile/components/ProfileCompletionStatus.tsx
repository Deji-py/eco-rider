// ProfileCompletionStatus.tsx
import React from 'react';
import { Alert } from '@/components/ui/Alert';

interface ProfileCompletionStatusProps {
  /**
   * Whether the profile has been approved/completed
   */
  profileComplete: boolean;

  /**
   * Show/hide the alert
   */
  visible?: boolean;

  /**
   * Callback when alert is closed
   */
  onClose?: () => void;
}

/**
 * ProfileCompletionStatus - Shows alert based on profile completion status
 *
 * @example
 * // Profile under review
 * <ProfileCompletionStatus
 *   profileComplete={false}
 *   visible={showAlert}
 *   onClose={() => setShowAlert(false)}
 * />
 *
 * // Profile approved
 * <ProfileCompletionStatus
 *   profileComplete={true}
 *   visible={showAlert}
 *   onClose={() => setShowAlert(false)}
 * />
 */
const ProfileCompletionStatus: React.FC<ProfileCompletionStatusProps> = ({
  profileComplete,
  visible = true,
  onClose,
}) => {
  if (!visible) return null;

  // Define content based on profile status
  const content = profileComplete
    ? {
        title: 'Profile Approved',
        message: 'Your profile has been approved! You now have full access to all features.',
      }
    : {
        title: 'Profile under review',
        message: 'We are reviewing your profile, you will be notified very soon of next action.',
      };

  return (
    <Alert
      variant={profileComplete ? 'success' : 'warning'}
      title={content.title}
      description={content.message}
      closable
      size="sm"
      showBorder={false}
      onClose={onClose}
    />
  );
};

export default ProfileCompletionStatus;
