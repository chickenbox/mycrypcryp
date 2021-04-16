namespace mycrypcryp { export namespace view {

    export class InfoPanel {
        readonly htmlElement = <div align="right" style="display: inline-block; background-color: white; padding: 4px; border: 1px solid black; border-radius: 4px;"/> as HTMLDivElement
        private interval: string
        private limit: number
        private smoothItr: number
        private minimumSample: number
        private isExpand = false

        constructor(){
            this.htmlElement.onclick = ev=>{
                this.isExpand = !this.isExpand
                this.refresh()
            }
            this.refresh()
        }

        set( interval: string, limit: number, smoothItr: number, minimumSample: number ){
            this.interval = interval
            this.limit = limit
            this.smoothItr = smoothItr
            this.minimumSample = minimumSample

            this.refresh()
        }

        private refresh(){
            
            if( this.isExpand ){
                this.htmlElement.innerHTML = ""
                this.htmlElement.appendChild(<div>
                    info<br/>
                    interval: {this.interval} limit: {this.limit}<br/>
                    smoothItr: {this.smoothItr} minimum sample: {this.minimumSample}<br/>
                </div>)
            }else{
                this.htmlElement.innerHTML = "info"
            }
        }
    }

}}