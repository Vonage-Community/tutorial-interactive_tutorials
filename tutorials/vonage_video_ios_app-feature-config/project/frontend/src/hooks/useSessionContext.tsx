import { useContext } from 'react';
import { SessionContext, SessionContextType } from '../Context/SessionProvider/session';

/**
 * React hook to access the session context containing Vonage Video API session data and functions.
 * @returns {SessionContextType} - The current context value for the Session Context.
 */
const useSessionContext = (): SessionContextType => {
  const context = useContext<SessionContextType>(SessionContext);
  return context;
};

export default useSessionContext;
