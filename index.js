require('dotenv').config()
const fs = require('fs')
const {
    Generator,
    CoinGeckoProvider,
    LegacyTokenProvider,
    ChainId,
} = require('utl-aggregator')

async function init() {
    const coinGeckoApiKey = process.env.COINGECKO_API_KEY ?? null
    const rpcUrl = process.env.RPC_URL
    const baseTokenListCdnUrl = process.env.TOKEN_LIST_CDN_URL

    const generator = new Generator([
        new CoinGeckoProvider(coinGeckoApiKey, rpcUrl, {
            throttle: 200,
            throttleCoinGecko: 65 * 1000,
            batchAccountsInfo: 1000,
            batchCoinGecko: 30,
        }),
        new LegacyTokenProvider(baseTokenListCdnUrl, rpcUrl, {
            throttle: 100,
            batchAccountsInfo: 1000,
            batchSignatures: 200,
            batchTokenHolders: 4,
        }),
    ])

    const tokenMap = await generator.generateTokenList(ChainId.MAINNET)

    fs.writeFile(
        './solana-tokenlist.json',
        JSON.stringify(tokenMap),
        'utf8',
        function (err) {
            if (err) {
                return console.log(err)
            }

            console.log('The file was saved!')
        }
    )
}

init().then(() => {
    console.log('UTL Completed')
})
