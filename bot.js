const { MessageEmbed, Client } = require('discord.js');
const client = new Client();
const dotenv = require('dotenv');
const web = require('./web.js');
dotenv.config({
    path: './.env'
});
client.on('ready', async () => {
    console.log(`Login ${client.user.username}
-------------------------------`);
    setInterval(async () => {
        var random = Math.floor(Math.random() * 6);
        if (random == 0) {
            await client.user.setPresence({
                status: 'online',
                    activity: {
                        name: '건의사항 채널에서 이모지를 눌러서 티켓 열기',
                        type: 'PLAYING'
                    }
            });
        } else if (random == 1) {
            await client.user.setPresence({
                status: 'online',
                    activity: {
                        name: client.user.username,
                        type: 'STREAMING',
                        url: `https://twitch.tv/${client.user.username}`
                    }
            });
        } else if (random == 2) {
            await client.user.setPresence({
                status: 'invisible'
            });
        } else if (random == 3) {
            await client.user.setPresence({
                status: 'online',
                    activity: {
                        name: '티켓 채널에서 X를 눌러서 티켓 닫기',
                        type: 'PLAYING'
                    }
            });
        } else if (random == 4) {
            await client.user.setPresence({
                status: 'online',
                    activity: {
                        name: '개인방 신청 채널에서 이모지를 눌러서 개인방 만들기',
                        type: 'PLAYING'
                    }
            });
        } else if (random == 5) {
            await client.user.setPresence({
                status: 'online',
                    activity: {
                        name: '봇이 다운타임일 경우에 서버장이나 서버장 비서에게 DM 보내서 수동으로 작업을 처리하기',
                        type: 'PLAYING'
                    }
            });
        }
    }, 5000);
    await client.channels.cache.get('707151006617829488').bulkDelete(1);
    const embed = new MessageEmbed()
        .setTitle('티켓 열기')
        .setColor(0x00ffff)
        .setDescription('건의사항이 있다면 아래 반응을 눌러 티켓을 열어주세요.\n봇이 재시작되었을 경우 티켓을 닫을 때 반응을 눌러도 닫히지 않을 수 있어요.\n티켓이 자동으로 닫히지 않으면 수동으로 채널을 삭제해주세요.')
        .setThumbnail(client.guilds.cache.get('707028253218570280').iconURL({
            dynamic: true,
            format: 'jpg',
            size: 2048
        }))
        .setFooter(client.guilds.cache.get('707028253218570280').name, client.guilds.cache.get('707028253218570280').iconURL({
            dynamic: true,
            format: 'jpg',
            size: 2048
        }))
        .setTimestamp();
    await client.channels.cache.get('707151006617829488').send(embed).then(async m => {
        await m.react('📩');
        const filter = (r, u) => r.emoji.name == '📩' && !u.bot;
        const collector = await m.createReactionCollector(filter);
        collector.on('collect', async (r, u) => {
            await r.users.remove(u);
            await client.guilds.cache.get('707028253218570280').channels.create(`🎫│티켓 ${u.id} ${Math.floor(Math.random() * 10000) + 1}`, {
                permissionOverwrites: [
                    {
                        id: r.message.guild.roles.everyone.id,
                        deny: [
                            'VIEW_CHANNEL',
                            'SEND_MESSAGES'
                        ]
                    },
                    {
                        id: u.id,
                        allow: [
                            'VIEW_CHANNEL',
                            'SEND_MESSAGES'
                        ]
                    },
                    {
                        id: '707111485754703893',
                        allow: [
                            'VIEW_CHANNEL',
                            'SEND_MESSAGES'
                        ]
                    },
                    {
                        id: '707118171634794527',
                        allow: [
                            'VIEW_CHANNEL',
                            'SEND_MESSAGES'
                        ]
                    }
                ],
                parent: r.message.guild.channels.cache.find(x => x.type == 'category' && x.name == '🎫 티켓')
            }).then(async ch => {
                await ch.send(`${u.toString()} ${r.message.guild.roles.cache.get('707111485754703893')} ${r.message.guild.roles.cache.get('707118171634794527')}`)
                const ___embed = new MessageEmbed()
                    .setTitle(`${client.user.username} 로그`)
                    .addField('타입', '티켓 생성')
                    .addField('티켓 채널', ch.toString())
                    .addField('실행한 유저', u.toString())
                    .setColor(0x00ffff)
                    .setThumbnail(client.guilds.cache.get('707028253218570280').iconURL({
                        dynamic: true,
                        format: 'jpg',
                        size: 2048
                    }))
                    .setFooter(client.guilds.cache.get('707028253218570280').name, client.guilds.cache.get('707028253218570280').iconURL({
                        dynamic: true,
                        format: 'jpg',
                        size: 2048
                    }))
                    .setTimestamp();
                await client.channels.cache.get('707156036217208883').send(___embed);
                const _embed = new MessageEmbed()
                    .setTitle('티켓 닫기')
                    .setDescription('티켓을 닫으려면 아래 이모지를 눌러주세요')
                    .setColor(0x00ffff)
                    .setThumbnail(client.guilds.cache.get('707028253218570280').iconURL({
                        dynamic: true,
                        format: 'jpg',
                        size: 2048
                    }))
                    .setFooter(client.guilds.cache.get('707028253218570280').name, client.guilds.cache.get('707028253218570280').iconURL({
                        dynamic: true,
                        format: 'jpg',
                        size: 2048
                    }))
                    .setTimestamp();
                await ch.send(_embed).then(async _m => {
                    await _m.react('❌');
                    const _filter = (r, u) => r.emoji.name == '❌' && !u.bot;
                    const _collector = await _m.createReactionCollector(_filter, {
                        max: 1
                    });
                    _collector.on('end', async collected => {
                        await collected.first().message.channel.delete();
                        const __embed = new MessageEmbed()
                            .setTitle(`${client.user.username} 로그`)
                            .addField('타입', '티켓 닫음')
                            .addField('티켓 채널', `\`#${collected.first().message.channel.name}\``)
                            .addField('실행한 유저', collected.first().users.cache.find(x => !x.bot).toString())
                            .setColor(0x00ffff)
                            .setThumbnail(client.guilds.cache.get('707028253218570280').iconURL({
                                dynamic: true,
                                format: 'jpg',
                                size: 2048
                            }))
                            .setFooter(client.guilds.cache.get('707028253218570280').name, client.guilds.cache.get('707028253218570280').iconURL({
                                dynamic: true,
                                format: 'jpg',
                                size: 2048
                            }))
                            .setTimestamp();
                            await client.channels.cache.get('707156036217208883').send(__embed);
                    });
                });
            });
        });
    });
    await client.channels.cache.get('707130956322045972').bulkDelete(1);
    await client.channels.cache.get('707130956322045972').send(new MessageEmbed()
    .setTitle('개인방 신청하기')
    .setColor(0x00ffff)
    .setDescription('개인방을 사용하려면 아래 반응을 눌러주세요.\n(3일간 사용하지 않으면 자동으로 삭제돼요.)')
    .setThumbnail(client.guilds.cache.get('707028253218570280').iconURL({
        dynamic: true,
        format: 'jpg',
        size: 2048
    }))
    .setFooter(client.guilds.cache.get('707028253218570280').name, client.guilds.cache.get('707028253218570280').iconURL({
        dynamic: true,
        format: 'jpg',
        size: 2048
    }))
    .setTimestamp()
    ).then(async m => {
        await m.react('🏡');
        const filter = (r, u) => r.emoji.name == '🏡' && !u.bot;
        const collector = await m.createReactionCollector(filter);
        collector.on('collect', async (r, u) => {
            await r.users.remove(u);
        if (r.message.guild.channels.cache.some(x => x.type == 'text' && x.topic == u.id)) return u.send(`이미 개인방이 있는데요? ${r.message.guild.channels.cache.find(x => x.type == 'text' && x.topic == u.id)}`);
        r.message.guild.channels.create(`🏡│개인방 ${u.tag.replace(/#/gi, '-')}`, {
            type: 'text',
            permissionOverwrites: [
                {
                    id: u.id,
                    allow: [
                        'ADD_REACTIONS',
                        'ATTACH_FILES',
                        'EMBED_LINKS',
                        'MANAGE_CHANNELS',
                        'MANAGE_MESSAGES',
                        'MANAGE_ROLES',
                        'MANAGE_WEBHOOKS',
                        'MENTION_EVERYONE',
                        'READ_MESSAGE_HISTORY',
                        'SEND_MESSAGES',
                        'SEND_TTS_MESSAGES',
                        'USE_EXTERNAL_EMOJIS',
                        'VIEW_CHANNEL'
                    ],
                    deny: [
                        'CREATE_INSTANT_INVITE'
                    ]
                },
                {
                    id: r.message.guild.roles.everyone.id,
                    deny: [
                        'ADD_REACTIONS',
                        'ATTACH_FILES',
                        'CREATE_INSTANT_INVITE',
                        'EMBED_LINKS',
                        'MANAGE_CHANNELS',
                        'MANAGE_MESSAGES',
                        'MANAGE_ROLES',
                        'MANAGE_WEBHOOKS',
                        'MENTION_EVERYONE',
                        'SEND_MESSAGES',
                        'SEND_TTS_MESSAGES',
                        'USE_EXTERNAL_EMOJIS',
                        'READ_MESSAGE_HISTORY',
                        'VIEW_CHANNEL'
                    ]
                },
                {
                    id: '707111555321430078',
                    deny: [
                        'ADD_REACTIONS',
                        'ATTACH_FILES',
                        'CREATE_INSTANT_INVITE',
                        'EMBED_LINKS',
                        'MANAGE_CHANNELS',
                        'MANAGE_MESSAGES',
                        'MANAGE_ROLES',
                        'MANAGE_WEBHOOKS',
                        'MENTION_EVERYONE',
                        'SEND_MESSAGES',
                        'SEND_TTS_MESSAGES',
                        'USE_EXTERNAL_EMOJIS',
                        'READ_MESSAGE_HISTORY',
                        'VIEW_CHANNEL'
                    ]
                }
            ],
            parent: '707130917847564350',
            topic: u.id
        }).then(async ch => {
            u.send(`개인방이 생성되었어요! ${ch}
(참고로 3일간 사용하지 않을 경우 삭제돼요.)`);
            const filter = () => true;
            const collector = ch.createMessageCollector(filter, {
                idle: 259200000
            });
            collector.on('end', async collected => {
                await ch.delete();
                await u.send('3일 동안 개인방을 사용하지 않아서 채널이 자동으로 삭제되었어요.')
            });
        });
        })
    })
});
client.on('guildUpdate', async (_old, _new) => {
    await client.user.setAvatar(_new.iconURL({
        dynamic: true,
        format: 'jpg',
        size: 2048
    }));
});
client.login(process.env.TOKEN);
web.create(client);