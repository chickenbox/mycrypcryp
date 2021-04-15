namespace myCrypto {
    interface DataEntry {
        readonly price: number
        readonly time: Date
    }

    function normalizeData( data: DataEntry[] ){
        if( data.length>0 ){
            const min = data.reduce( (a,b)=>Math.min(a, b.price), data[0].price )
            const max = data.reduce( (a,b)=>Math.max(a, b.price), data[0].price )

            return data.map( d=>{
                return {
                    price: (d.price-min)/(max-min),
                    time: d.time
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
                    r += arr[i-1].price
                    cnt++
                }
                if( i<arr.length-1){
                    r += arr[i+1].price
                    cnt++
                }
                return {
                    price: r/cnt,
                    time: d.time
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
        readonly normalizedSmoothedData: DataEntry[]
        readonly dDataDt: number[]
        readonly dDataDDt: number[]

        constructor(
            data: DataEntry[],
            smoothItr: number = 0
        ){
            this.data = data
            this.normalizedSmoothedData = smoothData( normalizeData(data), smoothItr )

            this.dDataDt = dDataDT(this.normalizedSmoothedData.map(d=>d.price))
            this.dDataDDt = dDataDT(this.dDataDt)
        }

        get lastDDataDt(){
            if( this.dDataDt.length>0 )
                return Math.abs( this.dDataDt[this.dDataDt.length-1] )
            return Number.MIN_SAFE_INTEGER
        }
    }

}