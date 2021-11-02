import {ServerApiVersion} from 'mongodb'
export const env = process.env.dev || 'dev'
export const db_name = 'zs'
export const mongo_url = env=='dev'?"mongodb://localhost:27017/":process.env.MONGO_URL;
export const mongo_connect_options = env=='dev'?{useUnifiedTopology: true }:{useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }

