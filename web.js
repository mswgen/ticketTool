const http = require('http');
const axios = require('axios');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');
const Discord = require('discord.js');
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
            var parsed = url.parse(req.url, true);
            if (parsed.pathname == '/') {
                res.writeHead(200, {
                    'Content-Type': 'text/html; charset=utf-8'
                });
                fs.readFile('./logout.html', 'utf8', async (err, data) => {
                    res.end(data);
                });
            } else if (parsed.pathname == '/login') {
                var stateCode = parsed.query.img_url;
                res.writeHead(302, {
                    'Location': `https://discord.com/api/oauth2/authorize?client_id=707154241407549491&redirect_uri=${encodeURIComponent(process.env.CALLBACK)}&response_type=code&scope=guilds%20identify&state=${encodeURIComponent(stateCode)}`
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
                                if (response3.data.some(x => x.id == '707028253218570280')) {
                                    client.channels.cache.get('707528054796451851').send(new Discord.MessageEmbed()
                                        .setTitle('봇 개발자 인증 신청')
                                        .setColor(0x00ffff)
                                        .setThumbnail()
                                        .addField('신청 유저', `${response2.data.username}#${response2.data.discriminator}`)
                                        .setImage(decodeURIComponent(parsed.query.state))
                                        .setFooter(`${response2.data.username}#${response2.data.discriminator}`, getAvatar(response2))
                                        .setTimestamp()
                                    );
                                    fs.readFile('./done.html', 'utf8', async (err, data) => {
                                        res.writeHead(200, {
                                            'Content-Type': 'text/html; charset=uf-8'
                                        });
                                        res.end(data);
                                    });
                                } else {
                                    fs.readFile('./notinguild.html', 'utf8', async (err, data) => {
                                        res.writeHead(200, {
                                            'Content-Type': 'text/html; charset=uf-8'
                                        });
                                        res.end(data.replace(/!!!!!!tag!!!!!!/gi, `${response2.data.username}#${response2.data.discriminator}`));
                                    });
                                }
                            })
                        })
                    })
            } else if (parsed.pathname == '/style.css') {
                fs.readFile('./style.css', 'utf8', (err, data) => {
                    res.writeHead(200, {
                        'Content-Type': 'text/css; charset=utf-8'
                    });
                    res.end(data);
                })
            }
        });
        server.listen(3000);
    }
}