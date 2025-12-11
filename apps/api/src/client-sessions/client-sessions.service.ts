import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, inArray, count } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';
import { clientSession } from '../common/db/schema/client-session.schema';
import { clientFavourite } from '../common/db/schema/client-favourite.schema';
import { catalogue } from '../common/db/schema/catalogues.schema';
import { collection, photo } from '../common/db/schema';

@Injectable()
export class ClientSessionsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async addFavourites(slug: string, email: string, photoIds: string[]) {
    const [existingCatalogue] = await this.db
      .select({
        id: catalogue.id,
      })
      .from(catalogue)
      .leftJoin(collection, eq(catalogue.id, collection.catalogueId))
      .leftJoin(photo, eq(collection.id, photo.collectionId))
      .where(eq(catalogue.publicUrlSlug, slug));

    if (!existingCatalogue) {
      throw new NotFoundException(`Catalogue with slug ${slug} not found`);
    }

    // Check if all the photo Ids belong to the catalogue with the given slug
    const [result] = await this.db
      .select({
        photoCount: count(photo.id),
      })
      .from(photo)
      .leftJoin(collection, eq(photo.collectionId, collection.id))
      .where(
        and(
          eq(collection.catalogueId, existingCatalogue.id),
          inArray(photo.id, photoIds)
        )
      )
      .groupBy(collection.catalogueId);

    if (result?.photoCount !== photoIds.length) {
      throw new BadRequestException(
        `Provided photo IDs do not belong to the catalogue with slug ${slug}`
      );
    }

    const photoIdsSet = new Set(photoIds);

    let [existingSession] = await this.db
      .select()
      .from(clientSession)
      .where(
        and(
          eq(clientSession.email, email),
          eq(clientSession.catalogueId, existingCatalogue.id)
        )
      )
      .limit(1);

    const now = new Date();

    if (!existingSession) {
      existingSession = await this.db
        .insert(clientSession)
        .values({
          id: crypto.randomUUID(),
          email,
          catalogueId: existingCatalogue.id,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .then((res) => res[0]);
    }

    // Insert new favourites
    const favouritesToInsert = Array.from(photoIdsSet).map((photoId) => ({
      id: crypto.randomUUID(),
      clientSessionId: existingSession!.id,
      photoId,
    }));
    await this.db
      .delete(clientFavourite)
      .where(eq(clientFavourite.clientSessionId, existingSession!.id));
    await this.db.insert(clientFavourite).values(favouritesToInsert);

    return existingSession;
  }

  async getFavouritesBySession(sessionId: string, catalogueId: string, ownerId: string) {
    const [existingCatalogue] = await this.db.select()
      .from(catalogue)
      .where(eq(catalogue.id, catalogueId));

    if (!existingCatalogue) {
      throw new NotFoundException(`Catalogue with ID ${catalogueId} not found`);
    }

    if(existingCatalogue.ownerId !== ownerId) {
      throw new BadRequestException(`Forbidden`);
    }

    const [session] = await this.db
      .select()
      .from(clientSession)
      .where(eq(clientSession.id, sessionId))
      .limit(1);

    if (!session) {
      throw new NotFoundException(`Client session with ID ${sessionId} not found`);
    }
    
    const photos = await this.db.select({
      id: photo.id,
      originalFileName: photo.originalFileName,
      storagePath: photo.storagePath,
      thumbnailPath: photo.thumbnailPath,
      mimeType: photo.mimeType,
      width: photo.width,
      height: photo.height,
      size: photo.size,
      collectionId: photo.collectionId,
    }).from(photo)
      .innerJoin(
        clientFavourite,
        eq(photo.id, clientFavourite.photoId)
      )
      .where(eq(clientFavourite.clientSessionId, sessionId));

    return {
      ...session,
      sessionId: session.id,
      photos,
    };
  }
}
