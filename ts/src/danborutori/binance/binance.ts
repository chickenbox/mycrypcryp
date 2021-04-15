namespace danborutori { export namespace binance {

    declare class CryptoJS {
        static HmacSHA256( message: string, secret: string ): string
    }

    const domain = "https://api.binance.com"

    const apiKey = "apikey"
    const secret = "secret"

    export class Binance {

        private sign(queryString: string){
            const hash = CryptoJS.HmacSHA256(queryString, secret);
            return queryString+"&signature="+hash
        }

        fullPath( endPoint: string ){
            return `${domain}/api/v3${endPoint}`
        }

        // private async getTimestamp(){
        //     fetch(this.fullPath)
        // }

        async getExchangeInfo(){
            const response = await fetch(this.fullPath("/exchangeInfo"))
            const json = await response.json()
            return json
        }

        async getAccountInfo(){
            const params = new URLSearchParams()
            params.append("timestamp",Date.now().toString())

            const response = await fetch(this.fullPath("/account")+"?"+this.sign(params.toString()),{
                headers: [
                    ["X-MBX-APIKEY", apiKey]
                ]
            })
            return response.json()
        }
    }

}}