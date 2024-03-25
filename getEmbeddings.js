const axios = require('axios');
const { get } = require('https');

require('dotenv').config();

const hf_key = process.env.HF_TOKEN

const config = {
  headers: {
    'Authorization': `Bearer ${hf_key}`,
    'Content-Type': 'application/json'
  }
}

async function getEmbedding(query) {
  // Define the OpenAI API url and key.
  const url = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2'

  const payload = { inputs: query }
  
  // Call OpenAI API to get the embeddings.
  let response = await axios.post(url, payload, config)

  if (response.status === 200) {
    return response?.data
    // return response.data.data[0].embedding
  } else {
    throw new Error(`Failed to get embedding. Status code: ${response.status}`)
  }
}

module.exports = getEmbedding;