'use client'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { VscArrowCircleLeft } from "react-icons/vsc";
import {useState,useEffect} from 'react'
import { RiRefund2Fill } from "react-icons/ri";


import {useRef} from 'react'

import { BsReceipt } from "react-icons/bs";
import Image from 'next/image'
const Page = ()=>{
    const contentRef = useRef(null)
    const Router = useRouter()
    const [Cards,ChangeCards] = useState([])
    useEffect(()=>{
        const getdata = async () => {
            const Session = await getSession()
            const session = await Session
            if (session == undefined){
                Router.push('/login')   
            }
            const request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Payments/${session.user.id}`)
            const response = await request.json()
            if (response.status == true){
               ChangeCards(response.data)
            }
        }
        getdata()
    },[])

      
    // Function to handle the back button click
    const handleBackButtonClick = () => {
        Router.push('/home')
    }
    const Card = (props) =>{
        const id  = props.id 

        // Function to Go To Refund Page 
    const handleRefundButtonClick = () => {
        const id = props.PaymentID
        Router.push(`/refund/${id}`)
    } 
         // Function to Handle Download Receipt 
    const handleDownloadReceipt =  () => {
        window.open(`/api/receipt/${id}`, '_blank');
    }
        return (
            <div className = 'flex flex-col items-center justify-center shadow-lg border rounded-lg p-6 m-2'>
                <div ref = {contentRef} className = 'flex flex-col items-start justify-center gap-2 bg-white '>
                <Image className = 'self-center' src = '/payment.jpg' width = {250} height = {250} alt = 'No Payments Found'/>
                    <h1 className = 'text-sm'>Name of Course : {props.CourseName}</h1>
                    <p className = 'text-sm'>Payment ID : {props.PaymentID}</p>
                    <p className = 'text-sm'>Course ID : {props.CourseID}</p>
                    <p className = 'text-sm'>Date Of Purchase : {props.DateofPurchase} </p>
                    <p className = 'text-sm'>Currency : {props.Currency}</p>
                    <p className = 'text-sm'>Amount ${props.Amount}</p>
                    <p>Payment Status : <label className = 'text-green-600'>{props.status}</label></p>
                    {props.mode == 'subscription' && <label>Subscription : 
                        {props.Active == true && <button className='p-2 border bg-green-600  rounded text-white'>Active</button>}
                        {props.Active == false && <button className='p-2 border bg-red-600  rounded text-white'>Not Active</button>}
                        </label>}
                   
                </div>
                <div className = ' self-center mt-6 flex  items-center justify-center gap-3'>
                    <button onClick = {handleDownloadReceipt} className = 'flex active:bg-white active:text-black border px-2 py-2 border-black rounded text-white bg-black shadow-lg items-center justify-center gap-2 text-sm'><BsReceipt size = {20} />Get Receipt </button>
                    <label className = 'text-xs items-center justify-center'>OR</label>
                    <button onClick={handleRefundButtonClick} className = 'text-sm active:bg-black active:text-white border shadow-lg px-2 py-2 rounded-lg flex gap-2 items-center justify-center'><RiRefund2Fill size = {20} />File Refund</button>
                    </div>
            </div>
        )
    }
    return (
        <div className = 'flex flex-col items-center justify-center '>
            <button onClick = {handleBackButtonClick} className = 'flex active:text-rose-600 items-center justify-center gap-1 fixed top-2 left-2'><VscArrowCircleLeft size={30} /> Back</button>
            <h1 className = 'text-xl mt-6'>SkillsHub📝 </h1>
            <label className = 'text-xs'>Payments</label>
            <div className = 'flex mt-24 flex-wrap gap-3 items-center justify-center'>
            {Cards.length != 0 && <> 
            {Cards.map((data)=><Card Active={data.Active} mode={data.mode}  id = {data.id} status = {data.status} Amount = {data.Amount} CourseName={data.CourseName} PaymentID={data.PaymentID} CourseID={data.CourseID} DateofPurchase={data.DateofPurchase} Currency = {data.Currency}/>)}</>}
            {Cards.length == 0 && <div className = 'flex gap-2 flex-col items-center justify-center'>
                <Image src = '/empty.gif' width = {100} height = {100} alt = 'No Payments Found'/>
                <h1 className = 'text-xl'>No Payments Found</h1>
                <p className = 'text-sm'>You have not made any payments yet.</p>
                <button onClick = {handleBackButtonClick} className = 'border active:bg-white active:text-black active:border-black bg-black px-3 py-2  shadow-lg text-white rounded'>Go back to Home</button>
            </div>}
           
        </div>
        
        </div>
    )
}
export default Page 