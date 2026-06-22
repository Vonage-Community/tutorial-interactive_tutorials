import { useContext } from 'react';
import {
  PreviewPublisherContext,
  PreviewPublisherContextType,
} from '../Context/PreviewPublisherProvider';

/**
 * React hook to access the preview publisher context containing selected publisher options.
 * @returns {PreviewPublisherContextType} - The current context value for the Preview Publisher Context.
 */
const usePreviewPublisherContext = (): PreviewPublisherContextType => {
  const context = useContext<PreviewPublisherContextType>(PreviewPublisherContext);
  return context;
};

export default usePreviewPublisherContext;
