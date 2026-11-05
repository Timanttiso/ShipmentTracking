/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('ships', (table) => {
        table.double('lon').nullable().alter()
        table.double('lat').nullable().alter()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.alterTable('ships', (table) => {
        table.decimal('lon').nullable().alter()
        table.decimal('lat').nullable().alter()
    })
};
