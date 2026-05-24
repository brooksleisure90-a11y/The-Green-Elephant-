exports.handler = async (event) => {
  if (event.httpMethod!== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { image } = JSON.parse(event.body);

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: '7de0a10b4c94b7f1e8d2e5b0c8f9d6e5a4b3c2d1', // SDXL + ControlNet
      input: {
        image: image,
        prompt: 'renaissance royal oil painting of a pet, ornate gold frame, regal, highly detailed, museum quality, Rembrandt lighting',
        negative_prompt: 'blurry, low quality, cartoon, anime, modern clothes',
        structure: 'scribble',
        num_inference_steps: 30
      }
    })
  });

  let prediction = await response.json();

  // Poll until done - Replicate takes 10-30 seconds
  while (prediction.status!== 'succeeded' && prediction.status!== 'failed') {
    await new Promise(r => setTimeout(r, 1000));
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
    });
    prediction = await poll.json();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ output: prediction.output })
  };
};