import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * Legacy payment screen — redirects into the new workflow payment directions step.
 */
export default function PaymentSignOffRedirect() {
  const { order } = useLocalSearchParams();
  return (
    <Redirect
      href={{
        pathname: '/user-tabs/payment-directions',
        params: order ? { order } : undefined,
      }}
    />
  );
}
