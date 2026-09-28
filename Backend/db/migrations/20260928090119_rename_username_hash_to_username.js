/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.renameColumn('username_hash', 'username')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.renameColumn('username', 'username_hash')
  })
};
