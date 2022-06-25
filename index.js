require('dotenv').config()
const {
    Generator,
    ProviderCoinGecko,
    ProviderLegacyToken,
    ChainId,
    Tag,
} = require('@solflare-wallet/utl-aggregator')
const fs = require('fs')

async function init() {
    const coinGeckoApiKey = process.env.COINGECKO_API_KEY ?? null
    const rpcUrlMainnet = process.env.RPC_URL_MAINNET
    const rpcUrlDevnet = process.env.RPC_URL_DEVNET
    const baseTokenListCdnUrl = process.env.TOKEN_LIST_CDN_URL

    // Can be used to clear cache
    // ProviderLegacyToken.clearCache(ChainId.MAINNET)
    // ProviderLegacyToken.clearCache(ChainId.DEVNET)

    const generator = new Generator([
        new ProviderCoinGecko(coinGeckoApiKey, rpcUrlMainnet, {
            throttle: 200,
            throttleCoinGecko: 65 * 1000,
            batchAccountsInfo: 200, // 1000
            batchCoinGecko: 2, // 400
        }),
        new ProviderLegacyToken(
            baseTokenListCdnUrl,
            rpcUrlMainnet,
            {
                throttle: 2000,
                batchAccountsInfo: 200, // 1000
                batchSignatures: 200, // 250
                batchTokenHolders: 1, // 4
            },
            [Tag.LP_TOKEN],
            ChainId.MAINNET
        ),
        new ProviderLegacyToken(
            baseTokenListCdnUrl,
            rpcUrlDevnet,
            {
                throttle: 2000,
                batchAccountsInfo: 1000, // 1000
                batchSignatures: 250, // 250
                batchTokenHolders: 1, // 4
            },
            [Tag.LP_TOKEN],
            ChainId.DEVNET,
            60,
            20
        ),
    ])

    const tokenMap = await generator.generateTokenList()

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
