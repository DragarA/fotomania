import {
    ClientSessionFavouritesResDto,
    ClientSessionsService,
} from '@repo/sdk';
import { useQuery } from '@tanstack/react-query';

export function useSessionFavouritesQuery(
    catalogueId: string,
    sessionId: string,
    enabled: boolean = true
) {
    return useQuery<ClientSessionFavouritesResDto>({
        queryKey: ['client-sessions', catalogueId, 'favourites', sessionId],
        queryFn: () =>
            ClientSessionsService.clientSessionsControllerGetCatalogueFavourites(
                {
                    catalogueId,
                    sessionId,
                }
            ) as Promise<ClientSessionFavouritesResDto>,
        enabled: enabled && Boolean(catalogueId) && Boolean(sessionId),
    });
}
