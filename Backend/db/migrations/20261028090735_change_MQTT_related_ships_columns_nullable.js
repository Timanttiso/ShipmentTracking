/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('ships', (table) => {
        table.string('ship_name').nullable().alter()
        table.decimal('lon').nullable().alter()
        table.decimal('lat').nullable().alter()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {  
    await knex.schema.alterTable('ships', (table) => {
        table.string('ship_name').notNullable().alter()
        table.decimal('lon').notNullable().alter()
        table.decimal('lat').notNullable().alter()
    })
};
