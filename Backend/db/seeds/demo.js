import bcrypt from 'bcrypt'

const DEMO_USERNAME = 'DemoUser'
const DEMO_EMAIL = 'DemoUser@demo.com'

const daysFromNow = (days) => new Date(Date.now() + days * 86400000)

// Example of how to run this seed below
// DEMO_PASSWORD='TestPass' npx knex seed:run --specific=demo.js

export async function seed(knex) {
    // Given when running the seed with prefix DEMO_PASSWORD='password';
    const password = process.env.DEMO_PASSWORD
    if(!password){
        new Error('Set DEMO_PASSWORD before running the seed')
    }

    await knex.transaction(async (trx) => {
        await trx('users').where({ username: DEMO_USERNAME }).delete()

        const [user] = await trx('users')
            .insert({
                username: DEMO_USERNAME,
                email: DEMO_EMAIL,
                password_hash: await bcrypt.hash(password, 12)
            }).returning('*')

        const destinations = await trx('destinations')
            .insert([
                {
                    destination_name: 'Kokkola',
                    lon: 23.1307,
                    lat: 63.8385,
                    user_id: user.id
                },
                {
                    destination_name: 'Helsinki',
                    lon: 24.9384,
                    lat: 60.1699,
                    user_id: user.id,
                },
                {
                    destination_name: 'Turku',
                    lon: 22.2666,
                    lat: 60.4518,
                    user_id: user.id
                },
                {
                    destination_name: 'Tallinn',
                    lon: 24.7536,
                    lat: 59.4370,
                    user_id: user.id
                }
            ]).returning('*')

        // Setting Kokkola as the default destination for the demo user
        await trx('users')
            .where({ id: user.id})
            .update({ default_destination_id: destinations[0].id})
        
        // Most of these are fictional and as such are not updated by the MQTT, since during presentation of the demo it would be good to have actual ships on the map and not rely on the MQTT to provide all of them
        // The last ship on the list is actually the only real one, this could be shown during the presentation, but it is not linked to any actual shipments. Just gotta hope the MQTT pings it location once at least so it is not empty :D
        // Picked the JENNY ship, since it is almost impossible for it to leave Finnish waters. Though it is not actually a cargo ship, should still be passable in the demo to show that the ship locations are actually tracked.
        const demoShips = [
            {
                mmsi: '230000001',
                ship_name: 'DEMO BALTIC STAR',
                lat: 59.9,
                lon: 24.2
            },
            {
                mmsi: '230000002',
                ship_name: 'DEMO NORDIC WIND',
                lat: 60.1,
                lon: 22.9
            },
            {
                mmsi: '230000003',
                ship_name: 'DEMO GULF TRADER',
                lat: 59.7,
                lon: 23.5
            },
            {
                mmsi: '230000004',
                ship_name: 'DEMO BOTHNIA',
                lat: 62.4,
                lon: 21.2
            },
            {
                mmsi: '230939250',
                ship_name: 'JENNY'
            }
        ]

        const now = new Date()
        // Simulates the ships having been updated and adds them.
        for (const ship of demoShips) {
            await trx('ships')
                .insert({ ...ship, updated_at: now })
                .onConflict('mmsi') // While trying to delete users I realized ships don't get deleted so this will avoid mmsi conflicts, if these already exist
                .ignore()   
        }
        const ships = await trx('ships').whereIn('mmsi', demoShips.map((s) => s.mmsi))
        const shipByMmsi = Object.fromEntries(ships.map((s) => [s.mmsi, s]))

        await trx('user_ships').insert([
            {
                user_id: user.id,
                ship_id: shipByMmsi['230000001'].id,
                ship_nickname: 'Baltic Star'
            },
            {
                user_id: user.id,
                ship_id: shipByMmsi['230000002'].id,
                ship_nickname: 'Nordic Wind'
            },
            {
                user_id: user.id,
                ship_id: shipByMmsi['230000003'].id,
                ship_nickname: 'Gulf Trader'
            },
            {
                user_id: user.id,
                ship_id: shipByMmsi['230000004'].id,
                ship_nickname: 'Bothnia'
            },
            {
                user_id: user.id,
                ship_id: shipByMmsi['230939250'].id,
                ship_nickname: 'Jenny'
            }
        ])

        await trx('shipments').insert([
            {
                shipment_name: 'Kokkola Kemikaali Lasti',
                eta: daysFromNow(1),
                status: 1,
                user_id: user.id,
                destination_id: destinations[0].id,
                ship_id: shipByMmsi['230000004'].id
            },
            {
                shipment_name: 'Helsinki Kontti Kuljetus',
                eta: daysFromNow(2),
                status: 1,
                user_id: user.id,
                destination_id: destinations[1].id,
                ship_id: shipByMmsi['230000001'].id
            },
            {
                shipment_name: 'Turku Paperi Rullat',
                eta: daysFromNow(5),
                status: 2,
                user_id: user.id,
                destination_id: destinations[2].id,
                ship_id: shipByMmsi['230000002'].id
            },
            {
                shipment_name: 'Tallinna elektroniikka tilaus',
                eta: daysFromNow(-3),
                status: 3,
                user_id: user.id,
                destination_id: destinations[3].id,
                ship_id: shipByMmsi['230000003'].id
            }
        ])
    })
}