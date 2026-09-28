/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.alterTable('shipments', (table) => {
        table.dateTime('created_at');
        table.dateTime('updated_at');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.alterTable('shipments', (table) => {
        table.dropColumn('created_at');
        table.dropColumn('updated_at');
    })
};
