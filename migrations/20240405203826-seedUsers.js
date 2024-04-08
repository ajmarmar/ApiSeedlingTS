module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    await db.collection('users').insertOne({username: 'admin', password: '$2a$10$W.xiJ4gOi9za5.XQz6uSH.VCDZEvrXMJaySQR1M7WuiPpC4ywiAX6', 
        email: 'admin@apiseedling.ts', firstName:'admin', lastName: 'admin', createdAt: new Date()});
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    await db.collection('users').deleteOne({username: 'admin'});
  }
};
