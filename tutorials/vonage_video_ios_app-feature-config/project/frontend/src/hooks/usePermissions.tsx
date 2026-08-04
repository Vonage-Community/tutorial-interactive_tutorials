import { useEffect, useState } from 'react';
import { DEVICE_ACCESS_STATUS } from '../utils/constants';

export type PermissionsHookType = {
  accessStatus: string | null;
  setAccessStatus: (status: string) => void;
};

/**
 * Hook for checking and managing the user's permissions for accessing the microphone and camera.
 * Queries the browser for permission status and provides the current status and a function to update it.
 * @returns {PermissionsHookType} The current access status and a function to manually update it.
 */
const usePermissions = (): PermissionsHookType => {
  const [accessStatus, setAccessStatus] = useState<string | null>(null);

  useEffect(() => {
    const permissionsToQuery: PermissionName[] = [
      'microphone',
      'camera',
    ] as unknown as PermissionName[];

    const queryPromises = permissionsToQuery.map((name) => navigator.permissions.query({ name }));

    Promise.all(queryPromises)
      .then((statuses) => {
        statuses.forEach((status) => {
          if (status.state === 'prompt') {
            // Handle pending state
            setAccessStatus(DEVICE_ACCESS_STATUS.PENDING);
          }
        });
      })
      .catch((error) => {
        if (
          error?.message?.includes(
            "value of 'name' member of PermissionDescriptor) is not a valid value for enumeration PermissionName."
          )
        ) {
          // Ignore Firefox error
          return;
        }
        console.error('Error querying permissions:', error);
      });
  }, []);

  return {
    accessStatus,
    setAccessStatus,
  };
};

export default usePermissions;
