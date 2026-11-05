/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('destinations', (table) => {
        table.double('lon').notNullable().alter()
        table.double('lat').notNullable().alter()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.alterTable('destinations', (table) => {
        table.decimal('lon').notNullable().alter()
        table.decimal('lat').notNullable().alter()
    })
};
