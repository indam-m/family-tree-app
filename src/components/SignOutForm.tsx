import { signOut } from 'next-auth/react';
import React from 'react';

interface SignOutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const SignOutForm: React.FC<SignOutFormProps> = ({
  isOpen,
  onClose,
  onSignOut,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut({
        callbackUrl: '/',
      });
      onSignOut();
      onClose();
    } catch (error) {
      setError('Failed to sign out. Please try again.');
      console.error('Sign out error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg min-w-[300px] shadow-lg">
        <p>Are you sure you want to logout?</p>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="hover:bg-gray-200 px-4 py-2 rounded-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-sm text-white bg-red-600 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Logout
          </button>
        </div>
        {error && <div className="text-red-600 mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default SignOutForm;
