import { useQuery, useMutation, useQueryClient, QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
export function useApi<TData>(
  queryKey: QueryKey,
  options?: Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => api<TData>(`/api/${queryKey.join('/')}`),
    ...options,
  });
}
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  relatedQueryKeys: QueryKey[] = []
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: () => {
      relatedQueryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}