namespace mycrypcryp { export namespace helper {

    export class Brain {
        constructor( readonly baseAsset: string ) {

        }

        predict( data: number[], lookback: number, predict: number ){
            const sampleLimit = 5
            const minimumSample = 5
    
            if( data.length>sampleLimit+predict+lookback ) { // limit data size
                data = data.slice(-sampleLimit-predict-lookback)
            }
    
            const trainingDataLen = data.length-predict-lookback
    
            const max = data.reduce((a,b)=>Math.max(a,b), Number.NEGATIVE_INFINITY)
            const min = data.reduce((a,b)=>Math.min(a,b), Number.POSITIVE_INFINITY)
            const range = max-min
            data = data.map( a=>(a-min)/range )
    
            if( trainingDataLen>=minimumSample ){
    
                const trainingData: NeuralNetworkTrainData[] = new Array(trainingDataLen)
                for( let i=0; i<trainingDataLen; i++ ){
                    trainingData[i] = {
                        input: data.slice(i,i+lookback),
                        output: data.slice(i+lookback,i+lookback+predict)
                    }
                }
    
                const net = new brain.NeuralNetwork()
                const key = `brain.net.${this.baseAsset}`
                let keepNetworkIntact = false

                const json = localStorage.getItem(key)
                if( json ){
                    net.fromJSON( JSON.parse(json) )
                    keepNetworkIntact = true
                }

                net.train(trainingData, {
                    keepNetworkIntact: keepNetworkIntact
                })
    
                const forecast = net.run( data.slice( -lookback ) ).map(a=>a*range+min)

                localStorage.setItem(key, JSON.stringify(net.toJSON()))
    
                return forecast
            }else{
                return []
            }
        }
    }

}}