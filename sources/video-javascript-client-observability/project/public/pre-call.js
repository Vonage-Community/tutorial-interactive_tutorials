export async function runPreCallTest({
  OT,
  NetworkTest,
  sessionInfo,
  audioSource,
  videoSource,
  onUpdate
}) {
  // TODO: Run connectivity and quality tests
  return {
    connectivity: {
      success: false,
      failedTests: []
    },
    quality: null
  };
}

export function getPreCallStatus(connectivity, quality) {
  // TODO: Set the waiting-room status
  return {
    status: "Fail",
    reason: "Complete the waiting-room status logic."
  };
}

export function getRecommendedPublisherOptions(quality) {
  // TODO: Apply the recommended Publisher settings
  return {};
}
