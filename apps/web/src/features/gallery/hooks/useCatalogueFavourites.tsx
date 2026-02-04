import { CataloguesService } from '@repo/sdk';
import { useQuery } from '@tanstack/react-query';

export interface ClientFavouriteSession {
    sessionId: string;
    email: string;
    createdAt: string;
    photoCount: number;
    clientName?: string;
    clientAddressStreet?: string;
    clientAddressCity?: string;
    clientAddressPostalCode?: string;
    clientAddressCountry?: string;
    clientPhoneNumber?: string;
    clientNotes?: string;
}

export function useCatalogueFavouritesQuery(catalogueId: string) {
    return useQuery<ClientFavouriteSession[]>({
        queryKey: ['catalogues', catalogueId, 'favourites'],
        queryFn: () =>
            CataloguesService.cataloguesControllerGetCatalogueFavourites({
                catalogueId,
            }) as Promise<ClientFavouriteSession[]>,
        enabled: Boolean(catalogueId),
    });
}
