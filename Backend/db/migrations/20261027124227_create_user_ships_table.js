/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  return knex.schema.createTable('user_ships', function (table) {
    table.increments('id').primary()
    table.integer('user_id')
            .unsigned()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE')
            .notNullable();
    table.integer('ship_id')
            .unsigned()
            .references('id')
            .inTable('ships')
            .onDelete('CASCADE')
            .notNullable();
    table.string('ship_nickname').notNullable()
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  return knex.schema.dropTable('user_ships');
};
