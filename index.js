import cors from 'fastify-cors';
import routes from './routes.js'
import fastify_fw from 'fastify'
import {mkdir} from 'fs/promises'
import {join, dirname} from 'path'
import fastifyStatic from 'fastify-static' 
import { fileURLToPath } from 'url';

const env = process.env.dev || 'dev'


const fastify = fastify_fw({ logger: true })

const __dirname = dirname(fileURLToPath(import.meta.url));

fastify.register(fastifyStatic, {
    root: join(__dirname, 'images')
})

fastify.addHook('onReady', async ()=> {
    await mkdir('images').catch((err)=>{})
})

fastify.register(cors, {origin:env=='prod'?process.env.FRONTEND_URL:'http://localhost:3000',credentials:true,methods:['GET','POST']})

  
fastify.register(routes)
// Run the server!



const start = async () => {
  try {    
    await fastify.listen(8000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()