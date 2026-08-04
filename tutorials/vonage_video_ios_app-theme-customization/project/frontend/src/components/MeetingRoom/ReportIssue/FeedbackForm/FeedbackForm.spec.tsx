import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FeedbackForm from './FeedbackForm';
import {
  REPORT_NAME_LIMIT,
  REPORT_DESCRIPTION_LIMIT,
  REPORT_TITLE_LIMIT,
} from '../../../../utils/constants';

describe('FeedbackForm', () => {
  const mockHandleSubmit = vi.fn();
  const mockHandleChange = vi.fn();
  const mockFileSelect = vi.fn();
  const formData = {
    title: '',
    name: '',
    issue: '',
  };
  const errors = {
    title: false,
    name: false,
    issue: false,
  };

  const defaultProps = {
    handleSubmit: mockHandleSubmit,
    formData,
    errors,
    handleChange: mockHandleChange,
    loading: false,
    onFileSelect: mockFileSelect,
  };

  it('renders form fields correctly', () => {
    render(<FeedbackForm {...defaultProps} />);

    // Check if the title input is rendered
    expect(screen.queryByTestId('title-report-issue')).toBeInTheDocument();

    // Check if the name input is rendered
    expect(screen.queryByTestId('name-report-issue')).toBeInTheDocument();

    // Check if the issue textarea is rendered
    expect(screen.queryByTestId('description-report-issue')).toBeInTheDocument();

    // Check if the button is rendered
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('shows required error messages when form inputs are empty', () => {
    const errorMessages = {
      title: true,
      name: true,
      issue: true,
    };

    const emptyFormProps = {
      ...defaultProps,
      errors: errorMessages,
    };

    render(<FeedbackForm {...emptyFormProps} />);

    // Check if error messages are shown
    expect(
      screen.getByText(`Title is required and must be less than ${REPORT_TITLE_LIMIT} characters`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Your name is required and must be less than ${REPORT_NAME_LIMIT} characters`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Description is required and must be less than ${REPORT_DESCRIPTION_LIMIT} characters`
      )
    ).toBeInTheDocument();
  });

  it('displays a loading spinner when loading is true', () => {
    const spinnerProps = {
      ...defaultProps,
      loading: true,
    };
    render(<FeedbackForm {...spinnerProps} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays helper text for character limit when exceeding limit for the form title', () => {
    const charLimitProps = {
      ...defaultProps,
      formData: {
        title: 'a'.repeat(REPORT_TITLE_LIMIT - 1),
        name: '',
        issue: '',
      },
      errors: {
        title: false,
        name: false,
        issue: false,
      },
    };
    const { rerender } = render(<FeedbackForm {...charLimitProps} />);
    const errorSpan = screen.getByTestId('title-error');
    // Tests that one-less than the max does not cause an error
    expect(errorSpan).toBeEmptyDOMElement();
    rerender(
      <FeedbackForm
        {...charLimitProps}
        formData={{
          title: 'a'.repeat(REPORT_TITLE_LIMIT),
          name: '',
          issue: '',
        }}
        errors={{
          title: true,
          name: false,
          issue: false,
        }}
      />
    );
    // Test that the max does cause an error
    expect(errorSpan).toBeInTheDocument();
    expect(errorSpan).toHaveTextContent(
      `Title is required and must be less than ${REPORT_TITLE_LIMIT} characters`
    );
    rerender(
      <FeedbackForm
        {...charLimitProps}
        formData={{
          title: 'a'.repeat(REPORT_TITLE_LIMIT - 1),
          name: '',
          issue: '',
        }}
        errors={{
          title: false,
          name: false,
          issue: false,
        }}
      />
    );
    // Tests that changing the string to less than the max makes the previous error message go away
    expect(errorSpan).toBeEmptyDOMElement();
  });

  it('displays helper text for character limit when exceeding limit for the form name', () => {
    const charLimitProps = {
      ...defaultProps,
      formData: {
        title: '',
        name: 'a'.repeat(REPORT_NAME_LIMIT - 1),
        issue: '',
      },
      errors: {
        title: false,
        name: false,
        issue: false,
      },
    };
    const { rerender } = render(<FeedbackForm {...charLimitProps} />);
    const errorSpan = screen.getByTestId('name-error');
    // Tests that one-less than the max does not cause an error
    expect(errorSpan).toBeEmptyDOMElement();
    rerender(
      <FeedbackForm
        {...charLimitProps}
        formData={{
          title: '',
          name: 'a'.repeat(REPORT_NAME_LIMIT),
          issue: '',
        }}
        errors={{
          title: false,
          name: true,
          issue: false,
        }}
      />
    );
    // Test that the max does cause an error
    expect(errorSpan).toBeInTheDocument();
    expect(errorSpan).toHaveTextContent(
      `Your name is required and must be less than ${REPORT_NAME_LIMIT} characters`
    );
    rerender(
      <FeedbackForm
        {...charLimitProps}
        formData={{
          title: '',
          name: 'a'.repeat(REPORT_NAME_LIMIT - 1),
          issue: '',
        }}
        errors={{
          title: false,
          name: false,
          issue: false,
        }}
      />
    );
    // Tests that changing the string to less than the max makes the previous error message go away
    expect(errorSpan).toBeEmptyDOMElement();
  });

  it('displays helper text for character limit when exceeding limit for the form description', () => {
    const charLimitProps = {
      ...defaultProps,
      formData: {
        title: '',
        name: '',
        issue: 'a'.repeat(REPORT_DESCRIPTION_LIMIT - 1),
      },
      errors: {
        title: false,
        name: false,
        issue: false,
      },
    };
    const { rerender } = render(<FeedbackForm {...charLimitProps} />);
    const errorSpan = screen.getByTestId('description-error');
    // Tests that one-less than the max does not cause an error
    expect(errorSpan).toBeEmptyDOMElement();
    rerender(
      <FeedbackForm
        {...charLimitProps}
        formData={{
          title: '',
          name: '',
          issue: 'a'.repeat(REPORT_DESCRIPTION_LIMIT),
        }}
        errors={{
          title: false,
          name: false,
          issue: true,
        }}
      />
    );
    // Test that the max does cause an error
    expect(errorSpan).toBeInTheDocument();
    expect(errorSpan).toHaveTextContent(
      `Description is required and must be less than ${REPORT_DESCRIPTION_LIMIT} characters`
    );
    rerender(
      <FeedbackForm
        {...charLimitProps}
        formData={{
          title: '',
          name: '',
          issue: 'a'.repeat(REPORT_DESCRIPTION_LIMIT - 1),
        }}
        errors={{
          title: false,
          name: false,
          issue: false,
        }}
      />
    );
    // Tests that changing the string to less than the max makes the previous error message go away
    expect(errorSpan).toBeEmptyDOMElement();
  });
});
