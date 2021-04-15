namespace mycrypcryp { export namespace setting { 

    export class AppSetting {
        static readonly shared = new AppSetting()

        currency = "HKD"
        quoteAsset = "USDT"     // default quota asset
        prioritySet = new Set(["BTC", "ETH", "USDT"])
    }

}}