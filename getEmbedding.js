const axios = require('axios')
require('dotenv').config();

async function getEmbedding(query) {
  // Define the OpenAI API url and key.
  const url = 'https://api.openai.com/v1/embeddings'
  const openai_key = process.env.OPENAI_KEY
  
  // Call OpenAI API to get the embeddings.
  let response = await axios.post(url, {
      input: query,
      model: "text-embedding-ada-002"
  }, {
      headers: {
          'Authorization': `Bearer ${openai_key}`,
          'Content-Type': 'application/json'
      }
  })
  
  if(response.status === 200) {
      return response.data.data[0].embedding
  } else {
      throw new Error(`Failed to get embedding. Status code: ${response.status}`)
  }
}

module.exports = getEmbedding;