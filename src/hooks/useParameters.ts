import { useQuery } from '@tanstack/react-query';
import { getParameters, getParameterByKey } from '@/api/parameters';

/**
 * Hook to fetch all parameters
 */
export const useParameters = () => {
  return useQuery({
    queryKey: ['parameters'],
    queryFn: getParameters,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

/**
 * Hook to get a specific parameter by key
 */
export const useParameter = (key: string) => {
  return useQuery({
    queryKey: ['parameter', key],
    queryFn: () => getParameterByKey(key),
    enabled: !!key,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

/**
 * Hook to calculate delivery fee based on cart total
 */
export const useDeliveryFee = (subtotal: number) => {
  const { data: deliveryFeeData, error: deliveryFeeError, isLoading: loadingFee } = useParameter('delivery_fee');
  const { data: thresholdData, error: thresholdError, isLoading: loadingThreshold } = useParameter('free_delivery_threshold');

  // Debug logging (remove in production)
  if (deliveryFeeError) {
    console.error('Error fetching delivery_fee parameter:', deliveryFeeError);
  }
  if (thresholdError) {
    console.error('Error fetching free_delivery_threshold parameter:', thresholdError);
  }

  const deliveryFee = deliveryFeeData?.value ? parseFloat(deliveryFeeData.value) : 0;
  const freeDeliveryThreshold = thresholdData?.value ? parseFloat(thresholdData.value) : 0;

  // Apply free delivery if subtotal is above threshold
  // Only apply free delivery if threshold is set and subtotal is above it
  const applicableDeliveryFee = (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) ? 0 : deliveryFee;

  return {
    deliveryFee: applicableDeliveryFee,
    freeDeliveryThreshold,
    isFreeDelivery: freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold,
    isLoading: loadingFee || loadingThreshold,
    error: deliveryFeeError || thresholdError
  };
};

