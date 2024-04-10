module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.collection('roles').createIndex( { role: 1, resource: 1, action: 1 }, { unique: true } )

    await db.collection('roles').insertMany(
      [
        { role: 'admin', resource: 'users', action: 'create:any', attributes: '*'},
        { role: 'admin', resource: 'users', action: 'read:any',   attributes: '*'},
        { role: 'admin', resource: 'users', action: 'update:any', attributes: '*'},
        { role: 'admin', resource: 'users', action: 'delete:any', attributes: '*'}, 
      
        { role: 'admin', resource: 'roles', action: 'create:any', attributes: '*'},
        { role: 'admin', resource: 'roles', action: 'read:any',   attributes: '*'},
        { role: 'admin', resource: 'roles', action: 'update:any', attributes: '*'},
        { role: 'admin', resource: 'roles', action: 'delete:any', attributes: '*'}, 
      
      ]);

  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    await db.collection('roles').dropIndex('role_1_resource_1_action_1');

    await db.collection('roles').drop();
  }
};
