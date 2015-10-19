import restify from 'restify';
import Promise from 'bluebird';
import MongoDB, { ObjectId } from 'mongodb';

Promise.promisifyAll(restify);
Promise.promisifyAll(MongoDB);

const { PORT, DB_URI, DB_NAME } = process.env;

const server = restify.createServer();

let db;

server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/plants', (req, res, next) => {
  db.collection('plants').find({}).toArray().then((plants) => {
    res.send(plants);
    next();
  });
});

server.get('/plants/:id', (req, res, next) => {
  db.collection('plants').findOne(
    { _id: ObjectId(req.params.id) }
  ).then((plants) => {
    res.send(plants);
    next();
  });
});

server.post('/plants', (req, res, next) => {
  db.collection('plants').insertOne(
    { name: req.body.name, age: req.body.age }
  ).then((plant) => {
    res.send(plant.ops[0]);
    next();
  });
});

server.put('/plants/:id', (req, res, next) => {
  db.collection('plants').findOneAndUpdate(
    { _id: ObjectId(req.params.id) },
    { $set: { name: req.body.name, age: req.body.age } },
    { returnOriginal: false }
  ).then(({ value: plant }) => {
    res.send(plant);
    next();
  });
});

server.del('/plants/:id', (req, res, next) => {
  db.collection('plants').findOneAndDelete(
    { _id: ObjectId(req.params.id) }
  ).then(({ value: plant }) => {
    res.send(plant);
    next();
  });
});

Promise.all([
  MongoDB.MongoClient.connect(`${DB_URI}/${DB_NAME}`),
  server.listen(PORT)
]).spread((_db) => {
  db = _db;
  console.log(`${server.name} listening at ${server.url}`);
})
