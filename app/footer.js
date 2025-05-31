'use client'
import { useRouter } from "next/navigation"

const footer = () =>{
    const Router = useRouter()
    //Function To Open Page
     const Click = (event)=>{
        if (event.target.id == '1'){
            window.location.href ='https://www.prashantjhim.com'
        }
        

     }
    return (
    <div className = 'flex h-16 justify-center items-center border-0 border-t text-sm fixed bottom-0 z-30 bg-white w-full    gap-3 flex-wrap'>
    <label>©TheEducornerTut.com</label>
    <label className=" rounded p-2 bg-black text-white i">Developer : Prashant Jhim</label>
   </div>
   )
}
export default footer