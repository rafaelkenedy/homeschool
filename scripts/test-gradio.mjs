import { client } from "@gradio/client";

async function run() {
  try {
    const app = await client("coqui/xtts");
    console.log("Successfully connected to coqui/xtts Space.");
    
    // Attempt to view the API expected inputs/outputs
    const api_info = await app.view_api();
    console.log(JSON.stringify(api_info, null, 2));
  } catch (error) {
    console.error("Failed to connect to Space:", error);
  }
}

run();
