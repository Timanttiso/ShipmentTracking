/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  return knex.schema.createTable('destinations', function (table) {
    table.increments('id').primary();
    table.string('destination_name').notNullable();
    table.decimal('lon').notNullable();
    table.decimal('lat').notNullable();
    table.integer('user_id')
            .unsigned()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  return knex.schema.dropTable('destinations')
};
