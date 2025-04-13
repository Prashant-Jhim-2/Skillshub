'use client' 
import Image from "next/image";
import {useRouter} from "next/navigation"
const Page = () =>{
    const Router = useRouter()
    const GoBack = () =>{
        Router.push("/purchases")
    }
    return (
        <div className="flex flex-col w-full items-center justify-center">
            <h1 className="text-xl mt-6">Skillshub📝</h1>
            <label className="text-xs mb-24">Success Page</label>
            <Image src="/tick.png" alt="Success" width={120} height={120} className="mt-6"/>
            <h1 className="text-xl mt-6">Payment Successfull</h1>
            <button onClick={GoBack} className = 'text-sm active:border-black active:bg-white active:shadow-button active:text-black flex gap-2 items-center justify-center border bg-black text-white rounded shadow-lg px-4 py-3 mt-6'>Go To Purchases             <Image src="/purchases.png" alt="Success" width={20} height={20} />
            </button>
        </div>
    )
}
export default Page