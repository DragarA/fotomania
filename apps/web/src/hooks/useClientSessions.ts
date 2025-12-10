import { AddFavouritesReqDtoClass, PublicService } from '@repo/sdk';
import { useMutation } from '@tanstack/react-query';

export function useAddFavouritesMutation() {
  return useMutation({
    mutationFn: ({
      slug,
      data,
    }: {
      slug: string;
      data: AddFavouritesReqDtoClass;
    }) =>
      PublicService.publicControllerAddFavourites({
        slug,
        requestBody: data,
      }),
  });
}
