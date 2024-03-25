
require('dotenv').config();
const fs = require('fs')
const { MongoClient, ServerApiVersion } = require('mongodb');
const getEmbedding = require('./getEmbedding');

const mongodb_password = process.env.MONGODB_PASSWORD
// const uri = `mongodb+srv://lloyo:${mongodb_password}@mdstrmcluster0.ztkujbf.mongodb.net/?retryWrites=true&w=majority`;

const uri = `mongodb://platform:${mongodb_password}@upgcluster0-36-shard-00-00-rwzij.mongodb.net:27017,upgcluster0-36-shard-00-01-rwzij.mongodb.net:27017,upgcluster0-36-shard-00-02-rwzij.mongodb.net:27017/streammanager-dev?ssl=true&retryWrites=false&replicaSet=UPGCluster0-36-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1`

const dbName = 'streammanager-dev'

const dbColleciton = 'show'
// const dbColleciton = 'genres_country'
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const input = {
    genres: 1075,
    description: 307,
    title: 154
}

// const DIMENSIONS = 1536

const LIMIT = 10000

const combineEmbeddings = (source, input) => {
    return Object.keys(input).map(async (key) => {
        if (!source[key] || source[key]?.length === 0) return []
        const embedding = await getEmbedding(source[key])
        if (!embedding) return []
        return embedding.slice(0, input[key])
    })
}

async function run(paramsToFind) {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        let i = 0

        const db = client.db(dbName)

        const collection = db.collection(dbColleciton)

        const cursor = collection.find(paramsToFind).limit(LIMIT)

        while (await cursor.hasNext()) {

            const doc = await cursor.next()
            // const result = combineEmbeddings(doc, input)
            // const combineOutput = await Promise.all(result)
            // await collection.updateOne({ '_id': doc['_id'] }, { $set: { 'genres_title_description_embedding': combineOutput.flat() } })
            
            // await collection.updateOne({ '_id': doc['_id'] }, { $set: { 'genres_country_embedding': combineOutput.flat() } })
            // await collection.replaceOne({ '_id': doc['_id'] }, doc)

            // // to delete
            // await collection.updateOne(
            //     { '_id': doc['_id'] },
            //     { $unset: { 'genres_country_embedding': 1, 'plot_embedding_hf': 1 } }
            // );

            // iterator
            i += 1
        }
        console.log(i)
        // write output into a file json
        // fs.writeFileSync('output.json', JSON.stringify(output,null,2))

        console.log('Operación completada con éxito')


    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

const paramsToFind = [
    { 'genres_title_description_embedding': { '$exists': true } },
    { 'genres': { '$exists': true, $ne: [] } },
    { 'description': { '$exists': true, $ne: [] } },
    { 'title': { '$exists': true, $ne: [] } },
    { 'images': { '$exists': true, $ne: [] } },
    // { 'country': { '$exists': true } },
    // { 'fullplot': { '$exists': true } },
    // { 'countries': { '$exists': true } },
    // { 'imdb.rating': { '$gt': 7.0 } },j
    // { 'imdb.rating': { '$gt': 7.0 } },j
]

run({ '$and': paramsToFind }).catch(console.dir);


// el usuario seleccion las caterorias que le atraen sabiendo que es de chile le sugiero primero las mas vistas

// esa seleccion tomo la categoria  la vecotrizo y la busco

// async function createCollection() {
//   try {
//     await client.connect();
//     const db = client.db(dbName);  // Reemplaza con el nombre de tu base de datos
//     const collection = db.collection('genres_country');  // Reemplaza con el nombre de tu colección
//     await collection.insertMany([
//         {
//           country: 'CHILE',
//           genres: ['adventure', 'action', 'fantasy', 'family', 'fantasy', 'musical', 'romance']
//         },
//         {
//           country: 'USA',
//           genres: ['amateur', 'alternative health', 'action', 'adventure'],
//         },
//         {
//           country: 'COLOMBIA',
//           genres: ['careers', 'christianity', 'college & high school', 'comedy', 'crime', 'design']
//         }
//       ])
    
//     console.log('load success');
//   } finally {
//     await client.close();
//   }
// }

// createCollection().catch(console.error);