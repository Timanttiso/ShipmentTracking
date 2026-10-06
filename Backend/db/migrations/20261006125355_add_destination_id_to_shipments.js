/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('shipments', (table) => {
        table.integer('destination_id', 255)
            .unsigned()
            .references('id')
            .inTable('destinations')
            .onDelete('CASCADE')
            .nullable()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.alterTable('shipments', (table) => {
        table.dropColumn('destination_id')
    })
};
