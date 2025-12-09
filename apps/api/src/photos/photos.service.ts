import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { catalogue } from '../common/db/schema/catalogues.schema';
import { collection } from '../common/db/schema/collections.schema';
import { photo } from '../common/db/schema/photos.schema';
import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@Injectable()
export class PhotosService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(createPhotoDto: CreatePhotoDto, ownerId: string) {
    // Verify the collection exists and user owns it (through catalogue)
    const [existingCollection] = await this.db
      .select({ collection, catalogue })
      .from(collection)
      .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
      .where(eq(collection.id, createPhotoDto.collectionId));

    if (!existingCollection) {
      throw new NotFoundException(
        `Collection with ID ${createPhotoDto.collectionId} not found`
      );
    }

    if (existingCollection.catalogue.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to add photos to this collection'
      );
    }

    const id = crypto.randomUUID();
    const now = new Date();

    const [newPhoto] = await this.db
      .insert(photo)
      .values({
        id,
        originalFileName: createPhotoDto.originalFileName,
        storagePath: createPhotoDto.storagePath,
        mimeType: createPhotoDto.mimeType,
        thumbnailPath: createPhotoDto.thumbnailPath,
        width: createPhotoDto.width,
        height: createPhotoDto.height,
        size: createPhotoDto.size,
        collectionId: createPhotoDto.collectionId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return newPhoto;
  }

  async findAll(collectionId: string, ownerId: string) {
    // Verify the collection exists and user owns it
    const [existingCollection] = await this.db
      .select({ collection, catalogue })
      .from(collection)
      .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
      .where(eq(collection.id, collectionId));

    if (!existingCollection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    if (existingCollection.catalogue.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to view photos in this collection'
      );
    }

    return this.db
      .select()
      .from(photo)
      .where(eq(photo.collectionId, collectionId))
      .orderBy(photo.createdAt);
  }

  async findOne(id: string, ownerId: string) {
    const [result] = await this.db
      .select({ photo, catalogue })
      .from(photo)
      .innerJoin(collection, eq(photo.collectionId, collection.id))
      .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
      .where(and(eq(photo.id, id), eq(catalogue.ownerId, ownerId)));

    if (!result) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }

    return result.photo;
  }

  async update(id: string, updatePhotoDto: UpdatePhotoDto, ownerId: string) {
    // First check if photo exists and user owns it
    await this.findOne(id, ownerId);

    const [updated] = await this.db
      .update(photo)
      .set({
        ...updatePhotoDto,
        updatedAt: new Date(),
      })
      .where(eq(photo.id, id))
      .returning();

    return updated;
  }

  async remove(id: string, ownerId: string) {
    // First check if photo exists and user owns it
    await this.findOne(id, ownerId);

    await this.db.delete(photo).where(eq(photo.id, id));

    return { message: 'Photo deleted successfully' };
  }

  async uploadFile(
    file: Express.Multer.File,
    collectionId: string,
    ownerId: string
  ) {
    // 1. Verify collection exists and user owns it
    const [existingCollection] = await this.db
      .select({ collection, catalogue })
      .from(collection)
      .innerJoin(catalogue, eq(collection.catalogueId, catalogue.id))
      .where(eq(collection.id, collectionId));

    if (!existingCollection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    if (existingCollection.catalogue.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to upload photos to this collection'
      );
    }

    // 2. Create photo record
    const photoId = crypto.randomUUID();
    const now = new Date();

    const photoData = {
      id: photoId,
      originalFileName: file.originalname,
      storagePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
      collectionId,
      thumbnailPath: null, // Future: generate thumbnail
      width: null, // Future: extract from EXIF
      height: null, // Future: extract from EXIF
      createdAt: now,
      updatedAt: now,
    };

    const [newPhoto] = await this.db
      .insert(photo)
      .values(photoData)
      .returning();

    return newPhoto;
  }
}
