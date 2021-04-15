namespace danborutori { export namespace binance {
    const domain = "https://api.binance.com"

    export class Binance {

        fullPath( endPoint: string ){
            return `${domain}/api/v3${endPoint}`
        }

        private async getTimestamp(){
            return (await (await fetch(this.fullPath("/time"))).json()).serverTime as number
        }

        async getExchangeInfo(){
            const response = await fetch(this.fullPath("/exchangeInfo"))
            const json = await response.json()
            return json
        }
    }
}}