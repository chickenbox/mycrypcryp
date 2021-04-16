namespace mycrypcryp { export namespace scene { 

    const smoothItr = 10
    const limit = 1000
    const minimumSample = 20

    interface BaseTrend {
        baseAsset: string
        trend: helper.TrendWatcher
    }

    const rangeOptions = [
        {
            title: "last 5 years",
            dateFunc: function(){
                let d = new Date()
                d.setFullYear(d.getFullYear()-5)
                return d
            }
        },
        {
            title: "last 1 years",
            dateFunc: function(){
                let d = new Date()
                d.setFullYear(d.getFullYear()-1)
                return d
            }
        },
        {
            title: "last 6 months",
            dateFunc: function(){
                let d = new Date()
                d.setMonth(d.getMonth()-6)
                return d
            }
        },
        {
            title: "last 3 months",
            dateFunc: function(){
                let d = new Date()
                d.setMonth(d.getMonth()-3)
                return d
            }
        }
    ]

    interface AssetEntry {
        baseAsset: string
        trend: helper.TrendWatcher
    }

    export class Landing {
        private infoPanel = new view.InfoPanel()

        private currentConversion = 0
        private interval: com.danborutori.cryptoApi.Interval = "1w"
        private currentRangeIndex = 0
        private openTime = rangeOptions[0].dateFunc()

        readonly htmlElement = <div style="position: relative;"></div> as HTMLDivElement

        private trends: AssetEntry[] = []


        constructor(){
            this.init()
        }

        private async init(){

            manager.LoadingManager.shared.begin()

            const info = await com.danborutori.cryptoApi.Binance.shared.getExchangeInfo()
            const filteredSymbols = info.symbols.filter(sym=>sym.quoteAsset==setting.AppSetting.shared.quoteAsset)
            const trends = await this.getTrends(filteredSymbols.map(s=>s.baseAsset))

            manager.LoadingManager.shared.end()

            this.trends = trends
            this.refresh()

            this.infoPanel.htmlElement.style.position = "absolute"
            this.infoPanel.htmlElement.style.top = "8"
            this.infoPanel.htmlElement.style.right = "8"
            this.infoPanel.set(this.interval, limit, smoothItr, minimumSample)
            this.htmlElement.appendChild(this.infoPanel.htmlElement)
        }

        private async refresh(){
            manager.LoadingManager.shared.begin()
            await this.getCurrentConversion()
            manager.LoadingManager.shared.end()


            const trends = this.trends.sort((a,b)=>{
                const cmp = (setting.AppSetting.shared.favourite.has(a.baseAsset)?-1:1) - 
                (setting.AppSetting.shared.favourite.has(b.baseAsset)?-1:1)
                if( cmp!=0 )
                    return cmp

                return Math.abs(a.trend.lastDDataDt)-Math.abs(b.trend.lastDDataDt)
            })

            this.htmlElement.innerHTML = ""
            this.htmlElement.appendChild(<center>
                1 {setting.AppSetting.shared.quoteAsset} = {this.currentConversion} {setting.AppSetting.shared.currency}<br/>
                <br/>
                range: <select onchange={ev=>{
                    const select = ev.target as HTMLSelectElement
                    this.currentRangeIndex = select.selectedIndex
                    this.openTime =  rangeOptions[select.selectedIndex].dateFunc()
                    this.refresh()
                }}>{
                    rangeOptions.map((opt, i)=>{
                        const option = <option>{opt.title}</option> as HTMLOptionElement
                        if( this.currentRangeIndex==i )
                            option.selected = true
                        return option
                    })
                }</select>
                <hr/>
                <div name="graphDiv"></div>
            </center>)

            const openTime = Math.max( this.openTime.getTime(), trends.reduce((a,b)=>Math.min(a,b.trend.data.first.open.getTime()),Number.MAX_VALUE))
            const closeTime = trends.reduce((a,b)=>Math.max(a,b.trend.data.last.close.getTime()),Number.MIN_VALUE)

            let rulerAdded = false

            const graphDiv = this.htmlElement.querySelector("div[name=graphDiv]") as HTMLDivElement
            trends.map(t=> {
                const isFavourite = setting.AppSetting.shared.favourite.has(t.baseAsset)
                if( !isFavourite ){
                    if( !rulerAdded ){
                        graphDiv.appendChild(<hr/>)
                        rulerAdded = true
                    }
                }

                graphDiv.appendChild(this.createGraph(
                    t.baseAsset,
                    setting.AppSetting.shared.quoteAsset,
                    t.trend,
                    {
                        open: new Date(openTime),
                        close: new Date(closeTime)
                    },
                    isFavourite
                ))
                graphDiv.appendChild(<br/>)
            })

            this.htmlElement.appendChild(this.infoPanel.htmlElement)
        }

        private async getCurrentConversion(){
            this.currentConversion = await com.danborutori.cryptoApi.CryptoCompare.shared.getPrice(setting.AppSetting.shared.quoteAsset,setting.AppSetting.shared.currency)
        }

        private async getTrends( baseAssets: string[]){

            const trends = (await Promise.all( baseAssets.map( async baseAsset=>{
                const data = await com.danborutori.cryptoApi.Binance.shared.getKlineCandlestickData(
                    `${baseAsset}${setting.AppSetting.shared.quoteAsset}`,
                    this.interval,
                    {
                        limit: limit
                    }
                )
                if( data.length<minimumSample ) return

                return {
                    baseAsset: baseAsset,
                    trend: new helper.TrendWatcher(data.map( d=>{
                        return {
                            price: (d.low+d.high)/2,
                            time: new Date((d.openTime.getTime()+d.closeTime.getTime())/2),
                            open: d.openTime,
                            close: d.closeTime
                        }
                    }), smoothItr)
                }
            }))).filter(a=>a)

            return trends
        }

        private createGraph(
            baseAsset: string,
            quoteAsset: string,
            trend: helper.TrendWatcher,
            range: {
                open: Date
                close: Date
            },
            isFavourite: boolean ){
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

            return <div style="display: inline-block;">
                <div align="left">
                <b>{baseAsset}</b><input onclick={ev=>{
                    if( setting.AppSetting.shared.favourite.has(baseAsset)){
                        setting.AppSetting.shared.favourite.delete(baseAsset)
                    }else{
                        setting.AppSetting.shared.favourite.add(baseAsset)
                    }
                    setting.AppSetting.shared.commit()
                    this.refresh()
                }}type="button" value={isFavourite?"★":"☆"} style="float: right;"></input>
                </div>
                {graph.htmlElement}<br/><br/>
            </div>
        }
    }

}}