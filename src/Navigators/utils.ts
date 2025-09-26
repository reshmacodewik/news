import { CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../Utils/Constant/constant';
import { navigationRef } from '../Utils/navigationRef';

export function navigate<T extends keyof RootStackParamList>(name: T): void;

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params: RootStackParamList[T],
): void;

export function navigate(name: keyof RootStackParamList, params?: unknown) {
  if (!navigationRef.isReady()) return;
  if (params === undefined) {
    navigationRef.navigate(name as any);
  } else {
    navigationRef.navigate(name as any, params as any);
  }
}

// Navigate and reset the navigation stack with multiple routes
export const navigateAndReset = <T extends keyof RootStackParamList>(
  routes: Array<{ name: T; params?: RootStackParamList[T] }>,
  index: number = 0,
) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes,
      }),
    );
  }
};

// Navigate and reset with a single route
export const navigateAndSimpleReset = <T extends keyof RootStackParamList>(
  name: T,
  index: number = 0,
) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes: [{ name }],
      }),
    );
  }
};

// Go back to the previous screen
export const goBackNavigation = () => {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
};
