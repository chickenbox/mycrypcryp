namespace mycrypcryp {

    export class App{
        async run(){
            console.log("started")

            const api = new danborutori.binance.Binance()
            console.log( await api.getAccountInfo() )
        }
    }

}