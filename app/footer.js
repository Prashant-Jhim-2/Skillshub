'use client'
import { useRouter } from "next/navigation"

const footer = () =>{
    const Router = useRouter()
    //Function To Open Page
     const Click = (event)=>{
        if (event.target.id == '1'){
            window.location.href ='https://www.prashantjhim.com'
        }
        if (event.target.id == "2"){
            Router.push("/admin")
        }

     }
    return (
    <div className = 'flex h-16 justify-center items-center border-0 border-t text-sm fixed bottom-0 z-30 bg-white w-full    gap-3 flex-wrap'>
    <button onClick={Click} id ='1' className = 'active:text-rose-600'>@PrashantJhim</button>
    <button onClick={Click} id ='2' className = 'active:text-rose-600'>Admin(testing)</button>
    <button onClick={Click} id ='3' className = 'active:text-rose-600'>Report a Bug</button>
   </div>
   )
}
export default footer