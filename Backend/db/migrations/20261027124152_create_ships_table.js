/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  return knex.schema.createTable('ships', function (table) {
    table.increments('id').primary();
    table.string('ship_name').notNullable();
    table.string('mmsi').notNullable().unique();
    table.decimal('lon').notNullable();
    table.decimal('lat').notNullable();
    table.dateTime('updated_at').nullable();
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  return knex.schema.dropTable('ships');
};
