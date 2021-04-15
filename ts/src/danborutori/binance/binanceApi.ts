namespace myCrypto {

    type SymbolStatus = "PRE_TRADING" | "TRADING" | "POST_TRADING" | "END_OF_DAY" | "HALT" | "AUCTION_MATCH" | "BREAK"
    type OrderType = "LIMIT" | "LIMIT_MAKER" | "MARKET" | "STOP_LOSS" | "STOP_LOSS_LIMIT" | "TAKE_PROFIT" | "TAKE_PROFIT_LIMIT"
    type Interval = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M"

    interface RateLimit {
    }

    interface ExchangeInfoResponse {

        timezone: string
        serverTime: number
        rateLimits: {
            rateLimitType: "REQUEST_WEIGHT" | "ORDERS" | "RAW_REQUESTS"
            interval: "SECOND" | "MINUTE" | "DAY"
            intervalNum: number
            limit: number
        }[]

        exchangeFilters: {
            filterType: "EXCHANGE_MAX_NUM_ORDERS" | "EXCHANGE_MAX_NUM_ALGO_ORDERS"
            maxNumAlgoOrders: number
        }[]

        symbols: {
            symbol: string
            status: SymbolStatus
            baseAsset: string,
            baseAssetPrecision: number,
            quoteAsset: string,
            quotePrecision: number, // will be removed in future api versions (v4+)
            quoteAssetPrecision: number,
            baseCommissionPrecision: number,
            quoteCommissionPrecision: number,
            orderTypes: OrderType[]
            icebergAllowed: boolean,
            ocoAllowed: boolean,
            quoteOrderQtyMarketAllowed: boolean,
            isSpotTradingAllowed: boolean,
            isMarginTradingAllowed: boolean,
            filters: [
                //These are defined in the Filters section.
                //All filters are optional
            ]
            permissions: string[]
        }[]
    }

    interface OrderBookResponse {
        lastUpdateId: number
        bids: number[][]
        asks: number[][]
    }

    interface CompressedAggregateTrade {
        a: number         // Aggregate tradeId
        p: number  // Price
        q: number  // Quantity
        f: number         // First tradeId
        l: number         // Last tradeId
        T: number // Timestamp
        m: boolean          // Was the buyer the maker?
        M: boolean           // Was the trade the best price match?
    }

    export class BinanceApi {

        fullUrl( path: string ){
            return `https://api.binance.com/api/v3${path}`
        }

        async getExchangeInfo() {

            const response = await fetch( this.fullUrl("/exchangeInfo") )
            return await response.json() as ExchangeInfoResponse

        }

        async getOrderBook( symbol: string, limit: 5 | 10 | 20 | 50 | 100 | 500 | 1000 | 5000 = 100){

            const response = await fetch( this.fullUrl("/depth")+"?"+new URLSearchParams({
                symbol: symbol,
                limit: limit.toString()
            }) )
            return await response.json() as OrderBookResponse

        }

        async getCompressedAggregateTradeList( symbol: string, options?: {
            fromId?: number
            startTime?: number
            endTime?: number
            limit?: number      // Default 500; max 1000.
        } ){
            const params = new URLSearchParams({
                symbol: symbol
            })
            options = options || {}
            for( let name in options ){
                params.append(name, options[name])
            }

            const respsone = await fetch( this.fullUrl("/aggTrades") +"?"+ params )

            return await respsone.json() as CompressedAggregateTrade[]
        }

        async getKlineCandlestickData(
            symbol: string,
            interval: Interval,
            options?: {
                startTime?: number
                endTime?: number
                limit? : number //Default 500; max 1000.
            }
        ){

            const params = new URLSearchParams({
                symbol: symbol,
                interval: interval
            })
            options = options || {}
            for( let name in options ){
                params.append(name, options[name])
            }

            const respsone = await fetch( this.fullUrl("/klines") +"?"+ params )

            return (await respsone.json() as any[][]).map(d=>{

                return {
                    openTime: new Date(d[0]),
                    open: parseFloat( d[1] ),
                    high: parseFloat( d[2] ),
                    low: parseFloat( d[3] ),
                    close: parseFloat( d[4] ),
                    volume: parseFloat( d[5] ),
                    closeTime: new Date(d[6]),
                    quoteAssetVolume: parseFloat(d[7]),
                    numberOfTrades: d[8],
                    takerBuyBaseAssetVolume: parseFloat(d[9]),
                    takerBuyQuoteAssetVolume: parseFloat(d[10])
                }
            })
            
        }
    }

}