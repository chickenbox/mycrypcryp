namespace mycrypcryp {

    export class App{
        async run(){
            console.log("started")

            this.testBinance()
        }

        private async testBinance(){

            console.log( await new myCrypto.CryptoCompare().getPrice("BTC", "HKD"))

            const api = new myCrypto.BinanceApi()

            const exchangeInfo = await api.getExchangeInfo()
            const symbols = exchangeInfo.symbols.filter(sym=>sym.symbol.endsWith("USDT"))

            const symTrends = (await Promise.all( symbols.map( async symbol=>{
                const data = await (await api.getKlineCandlestickData(symbol.symbol, "1w", {
                    limit: 100
                }))

                const trend = new myCrypto.TrendWatcher( data.map(d=>{
                    return {
                        price: (d.high+d.low)/2,
                        time: d.openTime
                    }
                }), 10 )

                return {
                    symbol: symbol,
                    trend: trend
                }
            }))).filter(e=>{
                return e.trend.data.length>=10 && e.trend.data[e.trend.data.length-1].price>=1
            })

            symTrends.sort((a,b)=>a.trend.lastDDataDt-b.trend.lastDDataDt)
            console.log( symTrends.map(s=>{
                return {
                    symbol: s.symbol.symbol,
                    n: s.trend.lastDDataDt,
                    trend: s.trend
                }
            }) )
            const trend = symTrends[50].trend 
            const data = trend.data

            const canvas = document.createElement("canvas")
            canvas.width = 512
            canvas.height = 512
            const drawer = new myCrypto.GraphicDrawer( canvas )
            drawer.drawGrid(data.length)
            drawer.draw( data.map(d=>d.price), "green" ) // original data
            drawer.draw( trend.normalizedSmoothedData.map(d=>d.price), "blue" ) // smoothed data
            // drawer.draw( trend.dDataDt, "red" ) // dPriceDT
            // drawer.draw( trend.dDataDDt, "purple" ) // dPriceDDT
            drawer.visualizeTurningPoint(
                trend.normalizedSmoothedData.map( (d,i)=>{
                    return {
                        value: d.price,
                        dvdx: trend.dDataDt[i],
                        dvddx: trend.dDataDDt[i]
                    }
                })
            )

            canvas.style.position = "absolute"
            canvas.style.top = "50%"
            canvas.style.left = "50%"
            canvas.style.transform = "translate(-50%,-50%)"
            document.body.appendChild(canvas)
            
            // if( data.length>0 ){
            //     console.log( `openTime: ${data[0].openTime}` )
            //     console.log( `closeTime: ${data[data.length-1].closeTime}` )
            // }
        }

    }

}