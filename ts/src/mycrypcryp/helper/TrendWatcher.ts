namespace mycrypcryp { export namespace helper {
    interface DataEntry {
        readonly price: number
        readonly time: Date
        readonly open: Date
        readonly close: Date
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

        readonly data: DataEntry[]
        readonly normalized: {
            high: number
            low: number
        }
        readonly normalizedSmoothedData: DataEntry[]
        readonly dDataDt: number[]
        readonly dDataDDt: number[]

        constructor(
            data: DataEntry[],
            smoothItr: number = 0
        ){
            this.data = data
            const normalizedData = normalizeData(data)
            this.normalized = {
                high: normalizedData.reduce((a,b)=>Math.max(a,b.price), Number.MIN_VALUE),
                low: normalizedData.reduce((a,b)=>Math.min(a,b.price), Number.MAX_VALUE)
            }
            this.normalizedSmoothedData = smoothData( normalizedData, smoothItr )

            this.dDataDt = dDataDT(this.normalizedSmoothedData.map(d=>d.price))
            this.dDataDDt = dDataDT(this.dDataDt)
        }

        get lastDDataDt(){
            if( this.dDataDt.length>0 )
                return this.dDataDt[this.dDataDt.length-1]
        }
    }

}}