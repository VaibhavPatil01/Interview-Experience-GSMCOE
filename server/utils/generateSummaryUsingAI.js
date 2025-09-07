import axios from 'axios';

const generateSummaryUsingAI = async (content) => {
  const url = 'https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6';

  const data = { inputs: content };

  const response = await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${process.env.AI_API_TOKEN_HUGGING_FACE}`, 
    },
  }); 

  return response.data[0].summary_text;
};

export default generateSummaryUsingAI;
