namespace mycrypcryp { export namespace view {

    export class SymbolGraph {
        readonly htmlElement = <div style="display: inline-block">
            <div style="display: inline-block">
                <canvas name="graphCanvas" width="200" height="200"></canvas>
                <div>
                    <font size="2">
                    <div name="from" style="display: inline-block; float:left;">from 2</div>
                    <div name="to" style="float:right;">to</div>
                    </font>
                </div>
            </div>
            <div align="left">
            <font size="2"><div name="info" align="left" style="display: inline-block;"></div></font>
            </div>
        </div>

        constructor(
            readonly quoteAsset: string,
            readonly trend: com.danborutori.cryptoApi.util.TrendWatcher,
            readonly range: {
                open: Date
                close: Date
            },
            readonly quoteToCurrency: {
                currency: string
                ratio: number
            }
        ){                
        }

        private updateInfo( trend: com.danborutori.cryptoApi.util.TrendWatcher ){
            const infoDiv = this.htmlElement.querySelector("div[name=info]") as HTMLDivElement

            const high = trend.data.reduce((a,b)=>Math.max(a,b.price),trend.data[0].price)
            const low = trend.data.reduce((a,b)=>Math.min(a,b.price),trend.data[0].price)

            infoDiv.appendChild(<div>
                H/L: {(high/low).toPrecision(3)} samples: {trend.data.length}<br/>
                high: {(high*this.quoteToCurrency.ratio).toFixed(5)}{this.quoteToCurrency.currency}<br/>
                low: {(low*this.quoteToCurrency.ratio).toFixed(5)}{this.quoteToCurrency.currency}<br/>
            </div>)
        }

        render(){

            const canvas = this.htmlElement.querySelector("canvas[name=graphCanvas]") as HTMLCanvasElement

            const trend = this.trend
            this.updateInfo(trend)

            const x = (trend.data.first.time.getTime()-this.range.open.getTime())*canvas.width/(this.range.close.getTime()-this.range.open.getTime())
            const width = (trend.data.last.time.getTime()-this.range.open.getTime())*canvas.width/(this.range.close.getTime()-this.range.open.getTime())-x

            const drawer = new com.danborutori.cryptoApi.util.GraphicDrawer(canvas)
            // drawer.drawGrid(trend.data.length, x, width)
            drawer.draw( trend.data.map(d=>d.price), "red", x, width )
            drawer.draw( trend.normalizedSmoothedData.map(d=>d.price), "green", x, width )
            drawer.visualizeTurningPoint(trend.normalizedSmoothedData.map((d,i)=>{
                return {
                    value: d.price,
                    dvdx: trend.dDataDt[i],
                    dvddx: trend.dDataDDt[i]
                }
            }), x, width)

            const from = this.htmlElement.querySelector("div[name=from]") as HTMLDivElement
            const to = this.htmlElement.querySelector("div[name=to]") as HTMLDivElement
            from.innerText = moment( trend.data.first.time ).format("MMMyyyy")
            to.innerText = moment( trend.data.last.time ).format("MMMyyyy")
        }
    }

}}