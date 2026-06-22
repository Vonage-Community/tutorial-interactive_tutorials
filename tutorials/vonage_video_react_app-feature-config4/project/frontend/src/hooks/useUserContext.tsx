import { useContext } from 'react';
import { UserContext, UserContextType } from '../Context/user';

/**
 * React hook to access the User context containing user information.
 * @returns {UserContextType} - The current context value for the User Context.
 */
const useUserContext = (): UserContextType => {
  const context = useContext<UserContextType | null>(UserContext);
  if (!context) {
    throw new Error('UserContext must be used within a UserProvider');
  }
  return context;
};

export default useUserContext;
