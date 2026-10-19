/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('users', (table) => {
        table.dropForeign('default_destination_id')
    })

    await knex.schema.alterTable('users', (table) => {
        table.foreign('default_destination_id')
        .references('id')
        .inTable('destinations')
        .onDelete('SET NULL')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.alterTable('users', (table) => {
        table.dropForeign('default_destination_id')
    })

    await knex.schema.alterTable('users', (table) => {
        table.foreign('default_destination_id')
        .references('id')
        .inTable('destinations')
        .onDelete('CASCADE')
    })
};
