import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import HelperText from './HelperText';

describe('HelperText', () => {
  let isError: boolean;
  let errorType: 'Title' | 'Your name' | 'Description';
  let colorStyle: 'inherit' | 'red';
  let textLimit: number;
  let formText: string;
  let testId: string;

  beforeEach(() => {
    isError = false;
    errorType = 'Title';
    colorStyle = 'inherit';
    textLimit = 5;
    formText = 'Your title is wrong and your feet smell :^)';
    testId = 'title-error';
  });

  it('if there is no error, displays no error text', () => {
    render(
      <HelperText
        isError={isError}
        errorType={errorType}
        colorStyle={colorStyle}
        textLimit={textLimit}
        formText={formText}
        testId={testId}
      />
    );

    expect(screen.getByTestId(testId).innerHTML).toEqual('');
  });

  it('if there is an error, displays error text', () => {
    isError = true;
    const expectedErrorText = `${errorType} is required and must be less than ${textLimit} characters`;

    render(
      <HelperText
        isError={isError}
        errorType={errorType}
        colorStyle={colorStyle}
        textLimit={textLimit}
        formText={formText}
        testId={testId}
      />
    );

    expect(screen.getByTestId(testId).innerHTML).toEqual(expectedErrorText);
  });
});
