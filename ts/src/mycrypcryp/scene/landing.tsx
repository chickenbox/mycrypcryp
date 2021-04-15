namespace mycrypcryp { export namespace scene { 

    const smoothItr = 10
    const interval: com.danborutori.cryptoApi.Interval = "1M"
    const limit = 1000
    const minimumSample = 20

    export class Landing {
        htmlElement = <div><center>
            <div name="usdthkdLabel"></div>
            interval: {interval} smoothItr: {smoothItr} limit: {limit} minimumSample: {minimumSample}<br/>
            <hr/>
            <div name="graphDiv"></div>
        </center></div> as HTMLDivElement

        private currentConversion = 0

        constructor(){
            this.init()
        }

        private async init(){
            manager.LoadingManager.shared.begin()

            this.getCurrentConversion()
            this.displayCurrentConversion()

            const info = await com.danborutori.cryptoApi.Binance.shared.getExchangeInfo()
            const filteredSymbols = info.symbols.filter(sym=>sym.quoteAsset==setting.AppSetting.shared.quoteAsset)
            const trends = await this.getTrends(filteredSymbols.map(s=>s.baseAsset))

            const openTime = trends.reduce((a,b)=>Math.min(a,b.trend.data.first.open.getTime()),Number.MAX_VALUE)
            const closeTime = trends.reduce((a,b)=>Math.max(a,b.trend.data.last.close.getTime()),Number.MIN_VALUE)

            let rulerAdded = false

            trends.forEach(t=> {
                if( !setting.AppSetting.shared.prioritySet.has(t.baseAsset) ){
                    if( !rulerAdded ){
                        const graphDiv = this.htmlElement.querySelector("div[name=graphDiv]") as HTMLDivElement
                        graphDiv.appendChild(<hr/>)
                        rulerAdded = true
                    }
                }

                this.updateGraph(
                    t.baseAsset,
                    setting.AppSetting.shared.quoteAsset,
                    t.trend,
                    {
                        open: new Date(openTime),
                        close: new Date(closeTime)
                    }
                )
            });

            manager.LoadingManager.shared.end()
        }

        private async getCurrentConversion(){
            this.currentConversion = await com.danborutori.cryptoApi.CryptoCompare.shared.getPrice(setting.AppSetting.shared.quoteAsset,setting.AppSetting.shared.currency)
        }

        private displayCurrentConversion(){
            const label = this.htmlElement.querySelector("div[name=usdthkdLabel]") as HTMLDivElement
            label.innerHTML = `1 ${setting.AppSetting.shared.quoteAsset} = ${this.currentConversion} ${setting.AppSetting.shared.currency}`
        }

        private async getTrends( baseAssets: string[] ){

            const trends = (await Promise.all( baseAssets.map( async baseAsset=>{
                const data = await com.danborutori.cryptoApi.Binance.shared.getKlineCandlestickData(
                    `${baseAsset}${setting.AppSetting.shared.quoteAsset}`,
                    interval,
                    {
                        limit: limit
                    }
                )
                if( data.length<minimumSample ) return

                return {
                    baseAsset: baseAsset,
                    trend: new com.danborutori.cryptoApi.util.TrendWatcher(data.map( d=>{
                        return {
                            price: (d.low+d.high)/2,
                            time: new Date((d.openTime.getTime()+d.closeTime.getTime())/2),
                            open: d.openTime,
                            close: d.closeTime
                        }
                    }), smoothItr)
                }
            }))).filter(a=>a)

            trends.sort((a,b)=>{
                const cmp = (setting.AppSetting.shared.prioritySet.has(a.baseAsset)?-1:1) - 
                (setting.AppSetting.shared.prioritySet.has(b.baseAsset)?-1:1)
                if( cmp!=0 )
                    return cmp

                return Math.abs(a.trend.lastDDataDt)-Math.abs(b.trend.lastDDataDt)
            })

            return trends
        }

        private updateGraph(
            baseAsset: string,
            quoteAsset: string,
            trend: com.danborutori.cryptoApi.util.TrendWatcher,
            range: {
                open: Date
                close: Date
            } ){
            const graph = new view.SymbolGraph(
                quoteAsset,
                trend,
                range,
                {
                    currency: setting.AppSetting.shared.currency,
                    ratio: this.currentConversion
                }
            )

            graph.render()

            const graphDiv = this.htmlElement.querySelector("div[name=graphDiv]") as HTMLDivElement
            graphDiv.appendChild(<div><b>{baseAsset}</b><br/>{graph.htmlElement}<br/><br/></div>)
        }
    }

}}