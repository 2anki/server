import knex from 'knex'

export class Database

	def constructor
		const CONNECTION_URI = process.env.DATABASE_URL || "postgres://postgres@localhost/dokku-postgres-dev"
		pg = knex({client: 'pg', connection: CONNECTION_URI})

	def create_schema
		const exists = await pg.schema.hasTable('users')
		console.log('users', exists)
		return if exists
		pg.schema.createTable('users') do |table|
			table.increments!
			table.string('email').unique!.notNullable!
			table.string('password').notNullable!
			table.boolean('superuser').notNullable!.defaultTo(false)
			table.timestamp('created_at').notNullable!.defaultTo(pg.raw('now()'))