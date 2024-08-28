const {
    Generator,
    ProviderCoinGecko,
    ProviderLegacyToken,
    ProviderTrusted,
		ProviderJupiterTokenList,
    ProviderIgnore,
    Tag,
    ChainId,
} = require('@solflare-wallet/utl-aggregator')
const { CronJob } = require('cron')
const fs = require('fs')

async function handle(fileName = null) {
    console.log(`${name} | start  ${inProgress} | ${new Date().toISOString()}`)

		const jupiterTokenListUrl = process.env.JUPITER_TOKEN_LIST_URL ?? "https://tokens.jup.ag/tokens?tags=strict"
		const trustedTokenList = process.env.TRUSTED_TOKEN_LIST_URL ?? null
    const ignoreTokenList = process.env.IGNORE_TOKEN_LIST_URL ?? null
    const coinGeckoApiKey = process.env.COINGECKO_API_KEY ?? null
    const rpcUrlMainnet = process.env.RPC_URL_MAINNET
    const rpcUrlDevnet = process.env.RPC_URL_DEVNET
    const baseTokenListCdnUrl = process.env.TOKEN_LIST_CDN_URL

    // Can be used to clear cache
    // ProviderLegacyToken.clearCache(ChainId.MAINNET)
    // ProviderLegacyToken.clearCache(ChainId.DEVNET)

    const generator = new Generator([
        ...(trustedTokenList
            ? [
                  new ProviderTrusted(trustedTokenList, [], ChainId.MAINNET),
                  new ProviderTrusted(trustedTokenList, [], ChainId.DEVNET),
              ]
            : []),
        // new ProviderCoinGecko(coinGeckoApiKey, rpcUrlMainnet, {
        //     throttle: 200,
        //     throttleCoinGecko: 65 * 1000,
        //     batchAccountsInfo: 200, // 1000
        //     batchCoinGecko: 2, // 400
        // }),
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
					new ProviderJupiterTokenList(
							jupiterTokenListUrl
					),
    ],
        [
            ...(ignoreTokenList
                ? [
                    new ProviderIgnore(ignoreTokenList, [], ChainId.MAINNET),
                    new ProviderIgnore(ignoreTokenList, [], ChainId.DEVNET),
                ]
                : []),
        ])

    const tokenMap = await generator.generateTokenList()

    console.log(`${name} | generated ${inProgress} | ${new Date().toISOString()}`)

    if (fileName) {
        fs.writeFile(
            `./${fileName}`,
            JSON.stringify(tokenMap),
            'utf8',
            function (err) {
                if (err) {
                    return console.log(`${name} | file errored`, err)
                }

                console.log(`${name} | file saved`)
            }
        )
    } else {
        console.log(`${name} | returned`)
        return tokenMap
    }
}

/* istanbul ignore next */
const cronJob = () =>
    new CronJob(
        process.env.CRON_TIME ?? '0 0 */4 * * *',
        async () => {
            if (inProgress) {
                console.log(`${name} | skip already running ${inProgress} | ${Date.now()}`)
                return
            }
            inProgress = Date.now()
            try {
                await handle('solana-tokenlist.json')
            } catch (err) {
                console.log(`${name} | errored ${inProgress}`, err)
            } finally {
                console.log(`${name} | finished ${inProgress} | ${Date.now()}`)
                inProgress = false
            }
        },
        null,
        true,
        'UTC'
    )

const name = 'generate-utl'

let inProgress = null

module.exports = { handle, cronJob }
