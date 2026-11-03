/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.alterTable('shipments', (table) => {
        table.integer('ship_id').unsigned().nullable()
    })

    await knex.raw(`
        INSERT INTO ships (mmsi)
        SELECT DISTINCT ship_mmsi
        FROM shipments
        WHERE ship_mmsi IS NOT NULL
        ON CONFLICT (mmsi) DO NOTHING
    `)

    await knex.raw(`
        UPDATE shipments
        SET ship_id = ships.id
        FROM ships
        WHERE ships.mmsi = shipments.ship_mmsi
    `)

    await knex.schema.alterTable('shipments', (table) => {
        table.integer('ship_id').unsigned().notNullable().alter()
        table
            .foreign('ship_id')
            .references('id')
            .inTable('ships')
            .onDelete('RESTRICT')
        table.index('ship_id')

        table.dropColumn('ship_mmsi')
        table.dropColumn('lon')
        table.dropColumn('lat')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => { 
    await knex.schema.alterTable('shipments', (table) => {
        table.string('ship_mmsi')
        table.decimal('lon')
        table.decimal('lat')
    })

    await knex.raw(`
        UPDATE shipments
        SET ship_mmsi = ships.mmsi,
            lon = ships.lon,
            lat = ships.lat
        FROM ships
        WHERE ships.id = shipments.ship_id
    `)

    await knex.schema.alterTable('shipments', (table) => {
        table.dropForeign('ship_id'),
        table.dropIndex('ship_id')
        table.dropColumn('ship_id')
    })
};
