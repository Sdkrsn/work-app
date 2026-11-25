import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function switchMode(mode: 'Work' | 'Personal') {
  if (navigationRef.isReady()) {
    navigationRef.navigate(mode as never);
  }
}
