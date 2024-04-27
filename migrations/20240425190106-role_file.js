module.exports = {
  async up(db, client) {
    await db.collection('files').createIndex( { createdAt: -1 } )

    await db.collection('roles').insertMany(
      [
        { role: 'admin', resource: 'files', action: 'create:any', attributes: '*'},
        { role: 'admin', resource: 'files', action: 'read:any',   attributes: '*'},
        { role: 'admin', resource: 'files', action: 'update:any', attributes: '*'},
        { role: 'admin', resource: 'files', action: 'delete:any', attributes: '*'}, 
      
        { role: 'user', resource: 'files', action: 'create:any', attributes: '*'},
        { role: 'user', resource: 'files', action: 'read:any',   attributes: '*'},
        { role: 'user', resource: 'files', action: 'update:any', attributes: '*'},
        { role: 'user', resource: 'files', action: 'delete:any', attributes: '*'}, 
      
      ]);
  },

  async down(db, client) {
    await db.collection('files').dropIndex('createdAt_-1');
    await db.collection('files').drop();

    await db.collection('roles').deleteMany({resource: 'files'});
  }
};
