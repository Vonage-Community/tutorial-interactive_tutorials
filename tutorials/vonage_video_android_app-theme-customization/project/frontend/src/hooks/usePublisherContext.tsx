import { useContext } from 'react';
import { PublisherContext, PublisherContextType } from '../Context/PublisherProvider';

/**
 * React hook to access the Publisher context containing Vonage Video API publisher data and functions.
 * @returns {PublisherContextType} - The current context value for the Publisher Context.
 */
const usePublisherContext = (): PublisherContextType => {
  const context = useContext<PublisherContextType>(PublisherContext);
  return context;
};

export default usePublisherContext;
