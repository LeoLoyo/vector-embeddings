require('dotenv').config();
const getEmbedding = require('./getEmbedding');
const MongoClient = require('mongodb').MongoClient

const mongodb_password = process.env.MONGODB_PASSWORD

const dbName = 'streammanager-dev'
const dbColleciton = 'show'

async function findSimilarDocuments(embedding) {
  const uri = `mongodb://platform:YrqJp6MFop6ip7UT@upgcluster0-36-shard-00-00-rwzij.mongodb.net:27017,upgcluster0-36-shard-00-01-rwzij.mongodb.net:27017,upgcluster0-36-shard-00-02-rwzij.mongodb.net:27017/streammanager-dev?ssl=true&retryWrites=false&replicaSet=UPGCluster0-36-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1`
  const client = new MongoClient(uri)
  try {
    await client.connect()

    const db = client.db(dbName) // Replace with your database name.
    const collection = db.collection(dbColleciton) // Replace with your collection name.

    // Query for similar documents.
    const documents = collection.aggregate([
      {
        "$vectorSearch": {
          "queryVector": embedding,
          "numCandidates": 1536,
          "path": "genres_title_description_embedding",
          "limit": 10,
          "index": "test_leo_2"
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          genres: 1,
        }
      }
    ])
    const resultAsArray = await documents.toArray()
    return resultAsArray
  } finally {
    await client.close()
  }
}

const getDocument = async (documentId) => {
  const uri = `mongodb://platform:${mongodb_password}@upgcluster0-36-shard-00-00-rwzij.mongodb.net:27017,upgcluster0-36-shard-00-01-rwzij.mongodb.net:27017,upgcluster0-36-shard-00-02-rwzij.mongodb.net:27017/streammanager-dev?ssl=true&retryWrites=false&replicaSet=UPGCluster0-36-shard-0&readPreference=primary&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-1`
  const client = new MongoClient(uri)
  try {
    await client.connect()

    const db = client.db(dbName) // Replace with your database name.
    const collection = db.collection('genres_country') // Replace with your collection name.
    const document = await collection.findOne({ 'country': documentId });

    if (!document) {
      console.log('Documento no encontrado');
      return null
    }
    return document
  } finally {
    await client.close()
  }
}

async function main(country, genres) {
  try {
    const genres_country = await getDocument(country)
    const documents = await findSimilarDocuments(
      genres_country?.genres_country_embedding ? await getEmbedding(genres) : genres_country?.genres_country_embedding
    )
    return documents
  } catch (err) {
    console.error(err)
  }
}

const country = 'CHILE' // 'CHILE' // 65c3e9b68b00e34770e9ac26

const genres = [
  "adventure",
  "action",
  "fantasy",
  "family",
  "fantasy",
  "musical",
  "romance"
]

main(country, genres)
