/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('users', (table) => {
        table.integer('default_destination_id', 255)
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
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('default_destination_id')
    })
};
