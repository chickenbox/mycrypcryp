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
            title: "last 3 years",
            dateFunc: function(){
                let d = new Date()
                d.setFullYear(d.getFullYear()-3)
                return d
            },
            downSampling: 7
        },
        {
            title: "last 1 years",
            dateFunc: function(){
                let d = new Date()
                d.setFullYear(d.getFullYear()-1)
                return d
            },
            downSampling: 7
        },
        {
            title: "last 6 months",
            dateFunc: function(){
                let d = new Date()
                d.setMonth(d.getMonth()-6)
                return d
            },
            downSampling: 7
        },
        {
            title: "last 3 months",
            dateFunc: function(){
                let d = new Date()
                d.setMonth(d.getMonth()-3)
                return d
            },
            downSampling: 7
        },
        {
            title: "last month",
            dateFunc: function(){
                let d = new Date()
                d.setMonth(d.getMonth()-1)
                return d
            },
            downSampling: 1
        },
        {
            title: "last 14 days",
            dateFunc: function(){
                let d = new Date()
                d.setTime(d.getTime()-1000*60*60*24*14)
                return d
            },
            downSampling: 1
        }
    ]

    type Sorting = "peak" | "name" | "ratio"

    const sortingOptions:{
        title: string
        value: Sorting
    }[] = [
        {
            title: "peak/valley",
            value: "peak"
        },
        {
            title: "name",
            value: "name"
        },
        {
            title: "ratio",
            value: "ratio"
        }
    ]

    interface AssetEntry {
        baseAsset: string
        trend: helper.TrendWatcher
    }

    export class Landing {
        private infoPanel = new view.InfoPanel()

        private currentConversion = 0
        private interval: com.danborutori.cryptoApi.Interval = "1d"
        private currentRangeIndex = 0
        private openTime = rangeOptions[0].dateFunc()
        private currentSortingIndex = 0
        private sorting: Sorting = "peak"

        readonly htmlElement = <div style="position: relative;"></div> as HTMLDivElement

        private dataByBaseAsset =  new Map<string, com.danborutori.cryptoApi.KlineCandlestickData[]>()
        private trends: AssetEntry[] = []
        private graphs: view.SymbolGraph[] = []


        constructor(){
            this.init()
        }

        private async init(){

            manager.LoadingManager.shared.begin()

            const info = await com.danborutori.cryptoApi.Binance.shared.getExchangeInfo()
            const filteredSymbols = info.symbols.filter(sym=>{
                return sym.quoteAsset==setting.AppSetting.shared.quoteAsset &&
                    (setting.AppSetting.shared.assetWhiteList.has(sym.baseAsset) ||  setting.AppSetting.shared.favourite.has(sym.baseAsset))&&
                    !(sym.baseAsset.endsWith("UP") || sym.baseAsset.endsWith("DOWN"))
            })
            await this.getData( filteredSymbols.map(s=>s.baseAsset) )
            const trends = this.getTrends()

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

                switch(this.sorting){
                case "peak":
                    return Math.abs(a.trend.lastDDataDt)-Math.abs(b.trend.lastDDataDt)
                case "name":
                    return a.baseAsset>b.baseAsset?1:a.baseAsset<b.baseAsset?-1:0
                case "ratio":
                    return -(a.trend.high/a.trend.low-b.trend.high/b.trend.low)
                }
            })

            this.htmlElement.innerHTML = ""
            this.htmlElement.appendChild(<center>
                <div name="header">
                1 {setting.AppSetting.shared.quoteAsset} = {this.currentConversion} {setting.AppSetting.shared.currency}<br/>
                <br/>
                range: <select onchange={ev=>{
                    const select = ev.target as HTMLSelectElement
                    const idx = select.selectedIndex
                    const option = rangeOptions[idx]
                    this.currentRangeIndex = idx
                    this.openTime = option.dateFunc()
                    this.redraw(trends, option.downSampling)
                }}>{
                    rangeOptions.map((opt, i)=>{
                        const option = <option>{opt.title}</option> as HTMLOptionElement
                        if( this.currentRangeIndex==i )
                            option.selected = true
                        return option
                    })
                }</select>
                &nbsp;&nbsp;sort: <select onchange={ ev=>{
                    const select = ev.target as HTMLSelectElement
                    this.currentSortingIndex = select.selectedIndex
                    this.sorting = sortingOptions[select.selectedIndex].value
                    this.refresh()
                }}>{
                    sortingOptions.map((opt, i)=>{
                        const option = <option>{opt.title}</option> as HTMLOptionElement
                        option.selected = i==this.currentSortingIndex
                        return option
                    })
                }</select>
                <hr/>
                </div>
                <div name="graphDiv" style="overflow-y: scroll;"></div>
            </center>)

            const openTime = Math.max( this.openTime.getTime(), trends.reduce((a,b)=>Math.min(a,b.trend.data.first.open.getTime()),Number.MAX_VALUE))
            const closeTime = trends.reduce((a,b)=>Math.max(a,b.trend.data.last.close.getTime()),Number.MIN_VALUE)

            let rulerAdded = false

            const graphDiv = this.htmlElement.querySelector("div[name=graphDiv]") as HTMLDivElement
            const graphs = trends.map(t=> {
                const isFavourite = setting.AppSetting.shared.favourite.has(t.baseAsset)
                return this.createGraph(
                    t.baseAsset,
                    setting.AppSetting.shared.quoteAsset,
                    t.trend,
                    {
                        open: new Date(openTime),
                        close: new Date(closeTime)
                    },
                    isFavourite
                )
            })
            graphs.forEach( g=>{
                if( !g.isFavourite ){
                    if( !rulerAdded ){
                        graphDiv.appendChild(<hr/>)
                        rulerAdded = true
                    }
                }

                graphDiv.appendChild( g.element )
                graphDiv.appendChild(<br/>)
            })
            this.graphs = graphs.map( g=>g.graph )

            this.htmlElement.appendChild(this.infoPanel.htmlElement)

            const header = this.htmlElement.querySelector("div[name=header]") as HTMLDivElement
            const rect = header.getBoundingClientRect()
            graphDiv.style.height = `${innerHeight-rect.height-30}px`
        }

        private async getCurrentConversion(){
            this.currentConversion = await com.danborutori.cryptoApi.CryptoCompare.shared.getPrice(setting.AppSetting.shared.quoteAsset,setting.AppSetting.shared.currency)
        }

        private redraw(trends: AssetEntry[], downSampling: number ){
            const openTime = Math.max( this.openTime.getTime(), trends.reduce((a,b)=>Math.min(a,b.trend.data.first.open.getTime()),Number.MAX_VALUE))
            const closeTime = trends.reduce((a,b)=>Math.max(a,b.trend.data.last.close.getTime()),Number.MIN_VALUE)

            this.graphs.forEach(g=>g.update({
                open: new Date(openTime),
                close:  new Date(closeTime),
                downSampling: downSampling
            }))
        }

        private async getData( baseAssets: string[] ){
            await Promise.all( baseAssets.map( async asset=>{
                const data = await com.danborutori.cryptoApi.Binance.shared.getKlineCandlestickData(
                    `${asset}${setting.AppSetting.shared.quoteAsset}`,
                    this.interval,
                    {
                        limit: limit
                    }
                )
                if( data.length>-minimumSample ){
                    this.dataByBaseAsset.set(asset, data)
                }
            }))
        }

        private getTrends(){
            const trends: AssetEntry[] = []

            for( let entry of this.dataByBaseAsset ){
                const baseAsset = entry[0]
                const data = entry[1]

                trends.push({
                    baseAsset: baseAsset,
                    trend: new helper.TrendWatcher(data.map( d=>{
                        return {
                            price: (d.low+d.high)/2,
                            time: new Date((d.openTime.getTime()+d.closeTime.getTime())/2),
                            open: d.openTime,
                            close: d.closeTime
                        }
                    }), smoothItr, rangeOptions[0].downSampling)
                })
            }

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
                baseAsset,
                trend,
                range,
                {
                    currency: setting.AppSetting.shared.currency,
                    ratio: this.currentConversion
                },
                (time, tolerance)=>{
                    this.addOrRemoveMarker(baseAsset, tolerance, time)
                    graph.renderGraph()
                }
            )

            graph.render()

            return {
                element: <div style="display: inline-block;">
                    <div align="left">
                    <b>{baseAsset}</b><input onclick={ev=>{
                        const input = ev.target as HTMLInputElement
                        if( setting.AppSetting.shared.favourite.has(baseAsset)){
                            setting.AppSetting.shared.favourite.delete(baseAsset)
                            input.value = "☆"
                        }else{
                            setting.AppSetting.shared.favourite.add(baseAsset)
                            input.value = "★"
                        }
                        setting.AppSetting.shared.commit()
                        // this.refresh()
                    }}type="button" value={isFavourite?"★":"☆"} style="float: right;"></input>
                    </div>
                    {graph.htmlElement}<br/><br/>
                </div>,
                graph: graph,
                isFavourite: isFavourite
            }
        }

        private addOrRemoveMarker(baseAsset: string, tolerance: number, time: Date){
            const markers = setting.AppSetting.shared.markers.get(baseAsset) || []

            const index = markers.findIndex( t=>Math.abs(t.getTime()-time.getTime())<=tolerance )
            if( index>=0 ){
                markers.remove(index)
            }else{
                markers.push( time )
                setting.AppSetting.shared.markers.set(baseAsset, markers)
            }
            setting.AppSetting.shared.commit()
        }
    }

}}