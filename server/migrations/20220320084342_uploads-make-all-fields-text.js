module.exports.up = (knex) => {
	return knex.schema.raw(`
    ALTER TABLE uploads ALTER COLUMN filename TYPE text;
    ALTER TABLE uploads ALTER COLUMN object_id TYPE text;
    ALTER TABLE uploads ALTER COLUMN external_url TYPE text;
    `)
};


module.exports.down = (knex) => {
	return knex.schema.raw(`
    ALTER TABLE uploads ALTER COLUMN key filename TYPE varchar(255);
    ALTER TABLE uploads ALTER COLUMN object_id filename TYPE varchar(255);
    ALTER TABLE uploads ALTER COLUMN external_url filename TYPE varchar(255);
    `);
};

