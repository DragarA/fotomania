import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, count } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../common/db/drizzle';
import { catalogue } from '../common/db/schema/catalogues.schema';
import { CreateCatalogueDto } from './dto/create-catalogue.dto';
import { UpdateCatalogueDto } from './dto/update-catalogue.dto';
import { v4 as uuid } from 'uuid'
import { collection } from '../common/db/schema/collections.schema';
import { photo } from '../common/db/schema/photos.schema';

@Injectable()
export class CataloguesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(createCatalogueDto: CreateCatalogueDto, ownerId: string) {
    const publicUrlSlug = uuid()

    const id = crypto.randomUUID();
    const now = new Date();

    const [newCatalogue] = await this.db
      .insert(catalogue)
      .values({
        id,
        ...createCatalogueDto,
        publicUrlSlug,
        ownerId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return newCatalogue;
  }

  async findAll(ownerId: string) {
    return this.db
        .select({
          catalogue,
          photoCount: count(photo.id),
        })
        .from(catalogue)
        .leftJoin(collection, eq(catalogue.id, collection.catalogueId))
        .leftJoin(photo, eq(collection.id, photo.collectionId))
        .groupBy(catalogue.id)
        .where(eq(catalogue.ownerId, ownerId));
  }

  async findOne(id: string, ownerId: string) {
    const [result] = await this.db.select().from(catalogue).where(and(eq(catalogue.id, id), eq(catalogue.ownerId, ownerId)));

    if (!result) {
      throw new NotFoundException(`Catalogue with ID ${id} not found`);
    }

    return result;
  }

  async findBySlug(slug: string) {
    const [result] = await this.db
      .select()
      .from(catalogue)
      .where(eq(catalogue.publicUrlSlug, slug));

    if (!result) {
      throw new NotFoundException(`Catalogue with slug ${slug} not found`);
    }

    return result;
  }

  async update(
    id: string,
    updateCatalogueDto: UpdateCatalogueDto,
    ownerId: string
  ) {
    // First check if catalogue exists and user owns it
    const existing = await this.findOne(id, ownerId);

    if (!existing) {
      throw new NotFoundException(`Catalogue with ID ${id} not found`);
    }

    if (existing.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to update this catalogue'
      );
    }

    const [updated] = await this.db
      .update(catalogue)
      .set({
        ...updateCatalogueDto,
        updatedAt: new Date(),
      })
      .where(eq(catalogue.id, id))
      .returning();

    return updated;
  }

  async remove(id: string, ownerId: string) {
    // First check if catalogue exists and user owns it
    const existing = await this.findOne(id, ownerId);

    if (!existing) {
      throw new NotFoundException(`Catalogue with ID ${id} not found`);
    }

    if (existing.ownerId !== ownerId) {
      throw new ForbiddenException(
        'You do not have permission to delete this catalogue'
      );
    }

    await this.db.delete(catalogue).where(eq(catalogue.id, id));

    return { message: 'Catalogue deleted successfully' };
  }
}
