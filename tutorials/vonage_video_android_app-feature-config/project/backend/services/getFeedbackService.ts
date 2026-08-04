import { FeedbackService } from './feedbackService';
import JiraFeedbackService from './jiraFeedbackService';

const getFeedbackService = (): FeedbackService => {
  return new JiraFeedbackService();
};

export default getFeedbackService;
