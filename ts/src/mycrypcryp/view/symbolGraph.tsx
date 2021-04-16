namespace mycrypcryp { export namespace view {

    export class SymbolGraph {
        readonly htmlElement = <div style="display: inline-block">
            <div style="display: inline-block">
                <canvas name="graphCanvas" width="200" height="100"></canvas>
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
            readonly trend: helper.TrendWatcher,
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

        private updateInfo( trend: helper.TrendWatcher ){
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
            const width = ((trend.data.last.time.getTime()-this.range.open.getTime())*canvas.width/(this.range.close.getTime()-this.range.open.getTime())-x)

            const drawer = new helper.GraphDrawer(canvas)
            // drawer.drawGrid(trend.data.length, x, width)
            drawer.drawCurve(
                trend.data.map(d=>d.price),
                "red",
                x,
                width,
                trend.data.reduce((a,b)=>Math.max(a,b.price), Number.MIN_VALUE),
                trend.data.reduce((a,b)=>Math.min(a,b.price), Number.MAX_VALUE)
            )
            drawer.drawCurve(
                trend.normalized.smoothedData.map(d=>d.price),
                "green",
                x,
                width,
                trend.normalized.high,
                trend.normalized.low
            )
            drawer.visualizeTurningPoint(trend.normalized.smoothedData.map((d,i)=>{
                return {
                    value: d.price,
                    dvdx: trend.dDataDt[i],
                    dvddx: trend.dDataDDt[i]
                }
            }), x, width,
            trend.normalized.high,
            trend.normalized.low)

            const from = this.htmlElement.querySelector("div[name=from]") as HTMLDivElement
            const to = this.htmlElement.querySelector("div[name=to]") as HTMLDivElement
            from.innerText = moment( this.range.open ).format("MMMyyyy")
            to.innerText = moment( this.range.close ).format("MMMyyyy")
        }
    }

}}