   netlify/functions/pet-picasso.js
export default async (req) => {
  const { image } = await req.json();
  
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: "9c77a6c567b3b4b21e3d8c9e5d2e1b1f5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c", // juggernaut-xl-v9
      input: {
        image: image,
        prompt: "oil painting of a cat as a royal king, renaissance style, ornate golden frame, royal robes, majestic, detailed fur, masterpiece",
        negative_prompt: "blurry, low quality, cartoon, text, watermark",
        num_inference_steps: 25,
        guidance_scale: 7.5
      }
    })
  });

  const prediction = await response.json();
  
  // Poll until done
  let final = prediction;
  while (final.status !== "succeeded" && final.status !== "failed") {
    await new Promise(r => setTimeout(r, 1000));
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${final.id}`, {
      headers: { "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}` }
    });
    final = await poll.json();
  }
  
  return new Response(JSON.stringify(final), {
    headers: { "Content-Type": "application/json" }
  });
};