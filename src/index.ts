import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { knownIngredients } from './constants/ingredients';
import { LLMResponse } from './types/llm.js';
import { stringParser } from './utils/string';
import bodyParser from "body-parser";
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express with TypeScript!');
});

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) 
      callback(null, true);
     else 
      callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.post('/speech-to-ingredients-list', async (req: Request, res: Response) => {
    const { text } = req.body;
    const model = req.query.model === 'gemma3' ? 'ingredients-gemma3:latest' : 'ingredients-llama3:latest';
    const response = await axios.post<LLMResponse>('http://localhost:11434/api/generate', {
      model,
      prompt: text,
      stream: false,
    });
  
    const parsedIngredients = stringParser(response.data.response);
    const foundIngredients = parsedIngredients.filter(ingredient =>
        knownIngredients.includes(ingredient),
    );
    const notFoundIngredients = parsedIngredients.filter(
      ingredient => !foundIngredients.includes(ingredient),
    );
  
    res.send({
      foundIngredients,
      notFoundIngredients,
      model,
    //   parsedIngredients,
    });
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
