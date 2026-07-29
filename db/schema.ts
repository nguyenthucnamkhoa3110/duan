import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const apartments = sqliteTable('apartments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  type: text('type').notNull(),
  district: text('district').notNull(),
  price: integer('price').notNull(),
  area: integer('area').notNull(),
  description: text('description').notNull(),
  amenities: text('amenities').notNull(),
  images: text('images').notNull(),
  featured: integer('featured').notNull().default(0),
  views: integer('views').notNull().default(0),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});
