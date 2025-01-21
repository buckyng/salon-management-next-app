/**
 * Utility function to generate query parameters for a fetch request.
 * @param params An object containing key-value pairs to be converted into query parameters.
 * @returns A string representing the query parameter string.
 */
export const fetchWithParams = (
  params: Record<string, string | undefined | null>
): string => {
  return new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    )
  ).toString();
};
