import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { NavbarService } from '../services/navbar.service';
export class CustomRouteReuseStrategy implements RouteReuseStrategy {

private storedRoutes = new Map<string, DetachedRouteHandle>();
private list_of_urls=["nothing"];
    

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
      console.log("in should detach", route.routeConfig)
      if(route.routeConfig){
        this.list_of_urls.push(route.routeConfig.path)
          console.log("if",route.routeConfig.path.includes("recommendations") || route.routeConfig.path.includes("linkcollab")   ||  route.routeConfig.path.includes("subscribings") || route.routeConfig.path.includes("trendings")  ||route.routeConfig.path.includes(":pseudo"))
          return route.routeConfig.path.includes("recommendations") || route.routeConfig.path.includes("linkcollab")   ||  route.routeConfig.path.includes("subscribings") || route.routeConfig.path.includes("trendings")  ||route.routeConfig.path.includes(":pseudo")
      }
      else{
          console.log("else")
          return false
      }
      
  }
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
      console.log("store",route.routeConfig)
    this.storedRoutes.set(route.routeConfig.path, handle);
  }
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    console.log("shoul attach",this.list_of_urls[this.list_of_urls.length-1].includes("popup/:category"))
    console.log(this.list_of_urls)
    return this.list_of_urls[this.list_of_urls.length-1].includes("popup/:category")
    //return !!route.routeConfig && !!this.storedRoutes.get(route.routeConfig.path);
  }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    console.log("retrieve")
      if(route.routeConfig  ){
        let interval = setInterval(()=>{
            console.log("resize")
            window.dispatchEvent(new Event('resize'))
             clearInterval(interval)
            
           
        },250)


        return this.storedRoutes.get(route.routeConfig.path);
      }

      return false
   
  }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    console.log("should reuse",future.routeConfig)
    console.log("should reuse 2",curr.routeConfig)
    if( future.routeConfig && curr.routeConfig ){
        console.log(true)
        return future.routeConfig === curr.routeConfig ;
    }
    else{
        console.log(false)
    }
    return false
  }
}