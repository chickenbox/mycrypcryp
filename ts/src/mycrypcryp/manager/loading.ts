namespace mycrypcryp { export namespace manager { 

    export class LoadingManager {

        static readonly shared = new LoadingManager()

        private loadingView = new view.Loading()
        private count = 0

        begin(){
            if( this.count==0 )
                document.body.appendChild(this.loadingView.htmlElement)
            this.count++
        }

        end(){
            this.count--
            if( this.count==0 )
                document.body.removeChild(this.loadingView.htmlElement)
        }
    }

}}