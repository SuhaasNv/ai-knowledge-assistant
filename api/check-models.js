// check-models.js (v2)
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("Error: GOOGLE_API_KEY is not set in your .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// A list of common models to test
const candidateModels = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-1.0-pro',
  'gemini-pro',
];

async function findWorkingModel() {
  console.log("Starting test to find a working chat model for your API key...");
  console.log("----------------------------------------");

  let foundModel = false;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Make a tiny, real request to be 100% sure it works
      await model.generateContent("hello"); 
      
      console.log(`✅ SUCCESS: Found a working model: ${modelName}`);
      foundModel = true;
      break; // Stop after finding the first working model
    } catch (error) {
      // Check if it's a 404 error, which means the model doesn't exist
      if (error.message.includes('404')) {
        console.log(`❌ INFO: Model '${modelName}' was not found.`);
      } else {
        // For other errors like permission or quota issues
        console.log(`❌ FAILED: Model '${modelName}' is not available. Reason: ${error.message}`);
      }
    }
  }

  console.log("----------------------------------------");
  if (!foundModel) {
    console.log("Could not find any working models from the list. Please double-check your API key, project setup, and billing status in the Google Cloud Console.");
  }
}

findWorkingModel();