import { ApiProperty } from '@nestjs/swagger';

import { catalogue } from '../../common/db/schema/catalogues.schema';
import { collection } from '../../common/db/schema/collections.schema';

type CatalogueEntity = typeof catalogue.$inferSelect;
type CollectionEntity = typeof collection.$inferSelect;

export class CollectionPublicResDto {
  @ApiProperty({
    description: 'Unique identifier of the collection',
    example: 'd63bb7c9-b5b3-4d91-89a9-32fd573017cc',
  })
  id!: string;

  @ApiProperty({
    description: 'Display name of the collection',
    example: 'Ceremony',
  })
  name!: string;

  constructor(payload: CollectionEntity ) {
    this.id = payload.id;
    this.name = payload.name;
  }
}

export class CataloguePublicResDto {
  @ApiProperty({
    description: 'Unique identifier of the catalogue',
    example: '7a934018-12bd-4501-9e7f-8d2b9669dcfb',
  })
  id!: string;

  @ApiProperty({
    description: 'Display title of the catalogue',
    example: 'Summer Wedding 2024',
  })
  title!: string;

  @ApiProperty({
    description: 'Optional description presented on the public page',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Optional cover image that will be shown to guests',
    required: false,
    example: '/uploads/catalogues/cat-123/cover.jpg',
  })
  coverImage?: string | null;

  @ApiProperty({
    description: 'Slug that identifies the catalogue in public routes',
    example: 'c0b4bf8c-0757-4c8d-bfa1-aa4a8f7bbf72',
  })
  publicUrlSlug!: string;

  @ApiProperty({
    description: 'Creation timestamp of the catalogue',
    example: '2024-02-05T10:15:32.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last modification timestamp of the catalogue',
    example: '2024-02-10T19:04:12.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Collections grouped under this catalogue',
    type: [CollectionPublicResDto],
  })
  collections?: CollectionPublicResDto[];

  constructor(data: {
    catalogue: CatalogueEntity;
    collections: CollectionEntity[];
  }) {
    const { catalogue, collections } = data;
    this.id = catalogue.id;
    this.title = catalogue.title;
    this.description = catalogue.description ?? null;
    this.coverImage = catalogue.coverImage ?? null;
    this.publicUrlSlug = catalogue.publicUrlSlug;
    this.createdAt = catalogue.createdAt;
    this.updatedAt = catalogue.updatedAt;
    this.collections = collections?.map(
      (item) => new CollectionPublicResDto(item)
    );
  }
}
