namespace mycrypcryp { export namespace helper {
    interface DataEntry {
        readonly price: number
        readonly time: Date
        readonly open: Date
        readonly close: Date
    }

    function downSample( data: DataEntry[], amount: number ){ 

        const downSampled: DataEntry[] = []

        for( let i=0; i<data.length; i+=amount ){
            const end = Math.min(i+amount,data.length)
            let price = 0
            let time = 0
            for( let j=i; j<end; j++ ){
                const d = data[j]
                price += d.price
                time += d.time.getTime()
            }
            price /= end-i
            time /= end-i

            downSampled.push({
                price: price,
                time: new Date(time),
                open: data[i].open,
                close: data[end-1].close
            })
        }

        return downSampled
    }

    function normalizeData( data: DataEntry[] ){
        if( data.length>0 ){
            const min = data.reduce( (a,b)=>Math.min(a, b.price), data[0].price )
            const max = data.reduce( (a,b)=>Math.max(a, b.price), data[0].price )

            return data.map( d=>{
                return {
                    price: (d.price-min)/(max-min),
                    time: d.time,
                    open: d.open,
                    close: d.close
                }
            })
        }else{
            return data
        }

    }

    function smoothData( data: DataEntry[], iteration: number ){
        let smoothedData = data
        for( let i=0; i<iteration; i++ ){
            smoothedData = smoothedData.map( (d, i, arr)=>{
                let r = d.price
                let cnt = 1
                if(i>0){
                    r += smoothedData[i-1].price
                    cnt++
                }
                if( i+1<smoothedData.length){
                    r += smoothedData[i+1].price
                    cnt++
                }
                return {
                    price: r/cnt,
                    time: d.time,
                    open: d.open,
                    close: d.close
                }
            })
        }
        return smoothedData
    }

    function dDataDT( data: number[] ){
        return data.map( (d,i,arr)=>{
            let dd = 0
            let cnt = 0
            if( i>0){
                dd += d-data[i-1]
                cnt++
            }
            if( i+1<data.length ){
                dd += data[i+1]-d
                cnt++
            }
            return cnt!=0?dd/cnt:0
        })
    }

    export class TrendWatcher {

        private _rawData: DataEntry[]
        data: DataEntry[]
        normalized: {
            high: number
            low: number
            smoothedData: DataEntry[]
        }
        dDataDt: number[]
        dDataDDt: number[]

        get high(){
            return this.data.reduce((a,b)=>Math.max(a,b.price), Number.MIN_VALUE)
        }

        get low(){
            return this.data.reduce((a,b)=>Math.min(a,b.price), Number.MAX_VALUE)
        }

        get lastProjectedPrice(){
            const high = this.high
            const low = this.low
            return this.normalized.smoothedData.last.price*(high-low)+low
        }

        private _downSampling: number
        get downSampling(){
            return this._downSampling
        }
        set downSampling( n: number ){
            if( this._downSampling!=n ){
                this._downSampling = n
                this.resampling()
            }
        }

        constructor(
            data: DataEntry[],
            readonly smoothItr: number = 0,
            downSample: number
        ){
            this._downSampling = downSample
            this._rawData = data
            this.resampling()
        }

        private resampling(){
            const data = downSample(this._rawData, this._downSampling)
            this.data = data
            const normalizedData = normalizeData(data)
            this.normalized = {
                high: normalizedData.reduce((a,b)=>Math.max(a,b.price), Number.MIN_VALUE),
                low: normalizedData.reduce((a,b)=>Math.min(a,b.price), Number.MAX_VALUE),
                smoothedData: smoothData( normalizedData, this.smoothItr )
            }

            this.dDataDt = dDataDT(this.normalized.smoothedData.map(d=>d.price))
            this.dDataDDt = dDataDT(this.dDataDt)
        }

        get lastDDataDt(){
            if( this.dDataDt.length>0 )
                return this.dDataDt[this.dDataDt.length-1]
        }
    }

}}