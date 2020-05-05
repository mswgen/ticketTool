const Discord = require('discord.js');
const dotenv = require('dotenv');
dotenv.config({
    path: './.env'
});
const manager = new Discord.ShardingManager('./bot.js', {
    token: process.env.TOKEN
});
manager.spawn();
manager.on('shardCreate', shard => {
    console.log(`new shard ${shard.id}`);
});