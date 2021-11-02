import {MongoClient} from 'mongodb';
import {mongo_url,db_name, mongo_connect_options} from './utils.js';
import {env} from './utils.js'
import {writeFile} from 'fs/promises'
export default async function(fastify, opts, done){

    fastify.post('/add_item/',async (request,reply) =>{
        const created_at = new Date()
        const {product_name,details,price,image} = request.body
        const mongo_connect = await MongoClient.connect(mongo_url,mongo_connect_options).catch((err)=>{request.log.info('Error while connecting to mongo db!');throw err});
        const database = await mongo_connect.db(db_name)
        const product_count = await  database.collection('product').countDocuments({product_name})
        if(product_count!=0){
            return reply.code(401).send()
        }
        const {name,base64} = image
        const image_path = `${name}`
        await writeFile(`images/${name}`, base64, 'base64')
        await database.collection('product').insertOne({product_name,details,price,image:image_path})
        await mongo_connect.close();
        return reply.code(200).send();
    })

    fastify.get('/item/:product_name',async (request,reply) =>{
        const {product_name} = request.params
        const mongo_connect = await MongoClient.connect(mongo_url,mongo_connect_options).catch((err)=>{request.log.info('Error while connecting to mongo db!');throw err});
        const database = await mongo_connect.db(db_name)
        const product = await database.collection('product').findOne({product_name})
        await mongo_connect.close();
        return reply.code(200).send(product);
    })

    fastify.delete('/item/:product_name',async (request,reply) =>{
        const {product_name} = request.params
        const mongo_connect = await MongoClient.connect(mongo_url,mongo_connect_options).catch((err)=>{request.log.info('Error while connecting to mongo db!');throw err});
        const database = await mongo_connect.db(db_name)
        const product = await database.collection('product').deleteOne({product_name})
        await mongo_connect.close();
        return reply.code(200).send();
    })

    fastify.put('/item/:product_name',async (request,reply) =>{
        const {product_name} = request.params
        const mongo_connect = await MongoClient.connect(mongo_url,mongo_connect_options).catch((err)=>{request.log.info('Error while connecting to mongo db!');throw err});
        const database = await mongo_connect.db(db_name)
        const {details,price,image} = request.body
        let set_body = {details,price}
        if(image){
            const {name,base64} = image
            const image_path = `${name}`
            await writeFile(`images/${name}`, base64, 'base64')
            set_body.image=image_path
        } 
        const product = await database.collection('product').updateOne({product_name},{$set:set_body})
        await mongo_connect.close();
        return reply.code(200).send();
    })

    fastify.get('/product_list/',async (request,reply) => {
        let {number,page,name} = request.query
        if(!number){number = 5}else{number=Number(number)}
        if(!page){page=1}
        page = Math.floor(page);
        const collection = 'product'
        const mongo_connect = await MongoClient.connect(mongo_url,mongo_connect_options).catch((err)=>{request.log.info('Error while connecting to mongo db!');throw err});
        const database = await mongo_connect.db(db_name)
        let query = {}
        if(name){
            query.product_name = {$regex:new RegExp('^'+name,'i')}
        }
        const result = await database.collection(collection).find(query).sort({_id:-1}).skip(number * page - number).limit(number).toArray().catch((err)=>{request.log.info(`Error while fetching ${collection} collection!`);throw err});  
        const total_records = await database.collection(collection).countDocuments(query);
        const page_count = Math.ceil(total_records / number);
        await mongo_connect.close();
        return reply.code(200).send({result,page_count,current_page:page})
    })


    
    done()
}