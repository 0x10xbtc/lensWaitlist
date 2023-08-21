import { ethers } from "ethers";
import axios from 'axios';
import * as fs from 'fs';

async function main() {
    try {
        const fileContents = fs.readFileSync('./wallets.txt', 'utf8');
        const wallets = fileContents.split('\r\n');

        for (let i = 0; i < wallets.length; i++) {
            const axiosIns = axios.create({
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67'
                },
                timeout: 60000,
            })
            let nonce: string;
            await axiosIns.get("https://waitlist-server.lens.dev/auth/nonce", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Microsoft Edge\";v=\"114\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "cross-site",
                    "sec-gpc": "1",
                    "Referer": "https://waitlist.lens.xyz/",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67'
                },
            }).then((res) => {
                console.log(i + ":" + JSON.stringify(res.data));
                if (res.data.success) {
                    nonce = res.data.nonce;
                }
            }).catch((error) => {
                console.log(i + ":" + `nonce error:${error}, ${JSON.stringify(axiosIns.defaults.httpsAgent.proxy)}`);
            });
            if (!nonce) {
                continue;
            }

            const walletItem = {
                address: wallets[i].split(',')[0],
                pk: wallets[i].split(',')[1],
            }

            let data = {
                message: `waitlist.lens.xyz wants you to sign in with your Ethereum account:\n${walletItem.address}\n\nSign in with Ethereum to the Lens Waitlist app.\n\nURI: https://waitlist.lens.xyz\nVersion: 1\nChain ID: 137\nNonce: ${nonce}\nIssued At: ${(new Date()).toISOString()}`,
                nonce: nonce,
                signature: ''
            }

            const wallet = new ethers.Wallet(walletItem.pk);
            const signature = await wallet.signMessage(data.message);
            data.signature = signature;
            await new Promise((resolve) => setTimeout(resolve, 1000));

            await axiosIns.post("https://waitlist-server.lens.dev/auth/verify", data, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "content-type": "application/json",
                    "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Microsoft Edge\";v=\"114\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "cross-site",
                    "sec-gpc": "1",
                    "Referer": "https://waitlist.lens.xyz/",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.67'
                },
            }).then((res) => {
                console.log(i + ":" + JSON.stringify(res.data));
            }).catch((error) => {
                console.log(i + ":" + `verify error:${error}, ${JSON.stringify(axiosIns.defaults.httpsAgent.proxy)}`);
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.log('all error ' + error);
    } finally {
        console.log('all complete');
    }
}
main()