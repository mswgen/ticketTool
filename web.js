const http = require('http');
const axios = require('axios');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');
const Discord = require('discord.js');
const nodemailer = require('nodemailer');
function getAvatar (r) {
    if (r.data.avatar) {
        return `https://cdn.discordapp.com/avatars/${r.data.id}/${r.data.avatar}.jpg?size=4096`;
    } else {
        return `https://cdn.discordapp.com/embed/avatars/${r.data.discriminator % 5}.png`;
    }
}
module.exports = {
    create: async client => {
        const server = http.createServer(async (req, res) => {
            try {
                var parsed = url.parse(req.url, true);
                if ((req.headers['user-agent'].indexOf("MSIE") > -1 || req.headers['user-agent'].indexOf("rv:") > -1) && parsed.pathname != '/style.css') {
                    fs.readFile('./ie.html', 'utf8', (err, data) => {
                        res.writeHead(400, {
                            'Content-Type': 'text/html; charset=utf-8'
                        });
                        res.end(data);
                    });
                    return;
                }
            if (parsed.pathname == '/') {
                res.writeHead(200, {
                    'Content-Type': 'text/html; charset=utf-8'
                });
                fs.readFile('./logout.html', 'utf8', async (err, data) => {
                    fs.readFile('./terms', 'utf8', (_err, _data) => {
                        res.end(data.replace(/!!!!!!terms!!!!!!/gi, _data));
                    });
                });
            } else if (parsed.pathname == '/login') {
                var stateCode = parsed.query.img_url;
                res.writeHead(302, {
                    'Location': `https://discord.com/api/oauth2/authorize?client_id=707154241407549491&redirect_uri=${encodeURIComponent(process.env.CALLBACK)}&response_type=code&scope=guilds%20identify%20email&state=${encodeURIComponent(stateCode)}`
                });
                res.end();
            } else if (parsed.pathname == '/callback') {
                    axios.post('https://discord.com/api/oauth2/token', qs.stringify({
                        'client_id': process.env.CLIENT_ID,
                        'client_secret': process.env.CLIENT_SECRET,
                        'grant_type': 'authorization_code',
                        'code': parsed.query.code,
                        'redirect_uri': process.env.CALLBACK,
                        'scope': 'identify guilds'
                    }), {
                        validateStatus: () => true,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).then(response => {
                        axios.get('https://discord.com/api/v6/users/@me', {
                            headers: {
                                Authorization: `${response.data.token_type} ${response.data.access_token}`
                            },
                            validateStatus: () => true
                        }).then(response2 => {
                            axios.get('https://discord.com/api/v6/users/@me/guilds', {
                                headers: {
                                    Authorization: `${response.data.token_type} ${response.data.access_token}`
                                },
                                validateStatus: () => true
                            }).then(response3 => {
                                axios.get(decodeURIComponent(parsed.query.state), {
                                    validateStatus: () => true
                                }).then(async response4 => {
                                if (response3.data.some(x => x.id == '707028253218570280') && ((response4.headers['content-type'] && response4.headers['content-type'].startsWith('image/')) || (response4.headers['Content-Type'] && response4.headers['Content-Type'].startsWith('image/')) || (response4.headers['content-Type'] && response4.headers['content-Type'].startsWith('image/')) || (response4.headers['Content-type'] && response4.headers['Content-type'].startsWith('image/')))) {
                                    const embed = new Discord.MessageEmbed()
                                        .setTitle('봇 개발자 인증 신청')
                                        .setColor(0xffff00)
                                        .setThumbnail()
                                        .addField('신청 유저', `${response2.data.username}#${response2.data.discriminator}`)
                                        .setImage(decodeURIComponent(parsed.query.state))
                                        .setFooter(`${response2.data.username}#${response2.data.discriminator}`, getAvatar(response2))
                                        client.channels.cache.get('707528054796451851').send(`<@&707111485754703893> <@&707118171634794527>`);
                                    client.channels.cache.get('707528054796451851').send(embed).then(async m => {
                                        await m.react('✅');
                                        await m.react('❌');
                                        const filter = (r, u) => (r.emoji.name == '✅' || r.emoji.name == '❌') && !u.bot;
                                        const collector = await m.createReactionCollector(filter, {
                                            max: 1
                                        });
                                        collector.on('end', async collected => {
                                            await m.reactions.removeAll();
                                            if (collected.first().emoji.name == '✅') {
                                                await embed.setTitle('봇 개발자 인증 완료')
                                                    .setColor(0x00ffff);
                                                await m.edit(embed);
                                                const embed2 = new Discord.MessageEmbed()
                                                    .setTitle('봇 개발자 인증이 진행되었어요')
                                                    .setColor(0x00ffff)
                                                    .addField('결과', '인증되었어요! 개발자 역할이 지급되었어요.')
                                                    .setTimestamp()
                                                    .setFooter(client.guilds.cache.get('707028253218570280').name, client.guilds.cache.get('707028253218570280').iconURL({
                                                        dynamic: true,
                                                        format: 'jpg',
                                                        size: 2048
                                                    }))
                                                    .setThumbnail(client.guilds.cache.get('707028253218570280').iconURL({
                                                        dynamic: true,
                                                        format: 'jpg',
                                                        size: 2048
                                                    }))
                                                await client.users.cache.get(response2.data.id).send(embed2).catch(async () => {
                                                    const transporter = nodemailer.createTransport({
                                                        service: 'gmail',
                                                        auth: {
                                                            user: process.env.GMAIL,
                                                            pass: process.env.GMAIL_PW
                                                        }
                                                    });
                                                    await transporter.sendMail({
                                                        from: process.env.GMAIL,
                                                        to: response2.data.email,
                                                        subject: `한곰서버 봇 개발자 인증이 진행되었어요.`,
                                                        text: '인증 결과: \n인증되었어요! 개발자 역할이 지급되었어요.'
                                                    }).catch(console.error)
                                                });
                                                await client.guilds.cache.get('707028253218570280').members.cache.get(response2.data.id).roles.add('707111555321430078');
                                            } else {
                                                await m.channel.send('인증 취소 이유를 입력해주세요.').then(async () => {
                                                    const _filter = (_m) => !_m.author.bot;
                                                    const _collector = await m.channel.createMessageCollector(_filter, {
                                                        max: 1
                                                    });
                                                    _collector.on('end', async _collected => {
                                                        await m.channel.bulkDelete(2);
                                                        await embed.setTitle('봇 개발자 인증 취소됨')
                                                            .setColor(0xff0000)
                                                            .addField('인증 취소 사유', _collected.first().content);
                                                        await m.edit(embed);
                                                        const embed2 = new Discord.MessageEmbed()
                                                            .setTitle('봇 개발자 인증이 진행되었어요')
                                                            .setColor(0xff0000)
                                                            .addField('결과', '인증되지 않았네요...')
                                                            .addField('인증 취소 사유', _collected.first().content)
                                                            .setTimestamp()
                                                            .setFooter(client.guilds.cache.get('707028253218570280').name, client.guilds.cache.get('707028253218570280').iconURL({
                                                                dynamic: true,
                                                                format: 'jpg',
                                                                size: 2048
                                                            }))
                                                            .setThumbnail(client.guilds.cache.get('707028253218570280').iconURL({
                                                                dynamic: true,
                                                                format: 'jpg',
                                                                size: 2048
                                                            }))
                                                        await client.users.cache.get(response2.data.id).send(embed2).catch(async () => {
                                                            const transporter = nodemailer.createTransport({
                                                                service: 'gmail',
                                                                auth: {
                                                                    user: process.env.GMAIL,
                                                                    pass: process.env.GMAIL_PW
                                                                }
                                                            });
                                                            await transporter.sendMail({
                                                                from: process.env.GMAIL,
                                                                to: response2.data.email,
                                                                subject: `한곰서버 봇 개발자 인증이 진행되었어요.`,
                                                                text: `인증 결과: \n인증되지 않았어요...\n인증 취소 사유:\n${_collected.first().content}`
                                                            });
                                                        });
                                                    });
                                                });
                                            }
                                        });
                                    });
                                    fs.readFile('./done.html', 'utf8', async (err, data) => {
                                        res.writeHead(200, {
                                            'Content-Type': 'text/html; charset=uf-8'
                                        });
                                        res.end(data.replace(/!!!!!!botTag!!!!!!/gi, client.user.tag));
                                    });
                                } else if ((response4.headers['content-type'] && response4.headers['content-type'].startsWith('image/')) || (response4.headers['Content-Type'] && response4.headers['Content-Type'].startsWith('image/')) || (response4.headers['content-Type'] && response4.headers['content-Type'].startsWith('image/')) || (response4.headers['Content-type'] && response4.headers['Content-type'].startsWith('image/'))) {
                                    fs.readFile('./notinguild.html', 'utf8', async (err, data) => {
                                        res.writeHead(400, {
                                            'Content-Type': 'text/html; charset=uf-8'
                                        });
                                        res.end(data.replace(/!!!!!!tag!!!!!!/gi, `${response2.data.username}#${response2.data.discriminator}`));
                                    });
                                } else {
                                    fs.readFile('./invalidurl.html', 'utf8', async (err, data) => {
                                        res.writeHead(400, {
                                            'Content-Type': 'text/html; charset=uf-8'
                                        });
                                        res.end(data);
                                    });
                                }
                            }).catch(() => {
                                fs.readFile('./invalidurl.html', 'utf8', async (err, data) => {
                                    res.writeHead(400, {
                                        'Content-Type': 'text/html; charset=uf-8'
                                    });
                                    res.end(data);
                                });
                            });
                        });
                        });
                    })
            } else if (parsed.pathname == '/style.css') {
                fs.readFile('./style.css', 'utf8', (err, data) => {
                    res.writeHead(200, {
                        'Content-Type': 'text/css; charset=utf-8'
                    });
                    res.end(data);
                })
            } else if (parsed.pathname == '/favicon.ico') {
                fs.readFile('./favicon.ico', (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end();
                    } else {
                        res.writeHead(200, {
                            'Content-Type': 'image/x-icon'
                        });
                        res.end(data);
                    }
                })
            } else {
                fs.readFile('./404.html', 'utf8', (err, data) => {
                    res.writeHead(404, {
                        'Content-Type': 'text/html; charset=utf-8'
                    });
                    res.end(data);
                })
            }
        } catch (e) {
            fs.readFile('./500.html', 'utf8', (err, data) => {
                res.writeHead(500, {
                    'Content-Type': 'text/html; charset=utf-8'
                });
                res.end(data
                    .replace(/!!!!!!mswgen!!!!!!/gi, client.users.cache.get('647736678815105037').tag)
                    .replace(/!!!!!!error!!!!!!/gi, e)
                );
            });
        }
        });
        server.listen(3000);
    }
}