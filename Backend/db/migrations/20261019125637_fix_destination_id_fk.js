/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('shipments', (table) => {
        table.dropForeign('destination_id')
    })

    await knex.schema.alterTable('shipments', (table) => {
        table.foreign('destination_id')
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
    await knex.schema.alterTable('shipments', (table) => {
        table.dropForeign('destination_id')
    })

    await knex.schema.alterTable('shipments', (table) => {
        table.foreign('destination_id')
        .references('id')
        .inTable('destinations')
        .onDelete('CASCADE')
    })
};
