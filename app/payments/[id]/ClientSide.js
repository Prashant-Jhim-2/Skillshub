'use client'
import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'
import Image from 'next/image'
import {useRef} from 'react'
import { VscArrowCircleLeft } from "react-icons/vsc";

import { useReactToPrint } from "react-to-print";
import { getSession } from 'next-auth/react';
import Link from 'next/link'
const Page = ({Details}) =>{
    const Router = useRouter()
    const contentRef = useRef(null);
    const Session = getSession()

    const GoBack = async() =>{
        const session = await Session 
        if (session.user.id == undefined){
            Router.push('/')
        }
        else {
            Router.push("/profile/"+ session.user.id)
        }
    }
    const DownloadPDF = useReactToPrint({
        contentRef,
        documentTitle:`${Details.Payments.PaymentID}-[Invoice]`
    })
    useEffect(()=>{
        if (Details.Payments == undefined && Details.Course == undefined){
            Router.push("/")
        }
    })
    return (
        <div className = 'flex flex-col items-center justify-center'>
            <button onClick = {GoBack} className = 'fixed  flex gap top-2 items-center justify-center left-2'> <VscArrowCircleLeft size={30}/> Back</button>
            <div ref = {contentRef} className = "flex flex-col items-center justify-center">
            <h1 className = ' text-3xl mt-6'>Skillshub📝</h1>
            <div className = 'flex flex-col mt-12 items-center justify-center'>
                <h1 className = 'cursor-pointer text-2xl'><Link href = {`/courses/${Details.Payments.CourseID}`}>{Details.Course.Name}</Link></h1>
                <Image
                src = {Details.Course.ImgSrc}
                width={500}
                height={500}
                />
        
            </div>
            <div className = 'flex flex-col mt-12 items-center justify-center'>
                <h1 className = 'text-lg'>Payment Details</h1>
                <p className = 'text-sm'>ProfileID : <label className = 'text-rose-500'>{Details.Payments.ProfileID}</label></p>
                <p className = 'text-sm'>Name : <label className = 'text-green-600'>{Details.Payments.Name}</label> </p>
                <p className = 'text-sm'>Email : <label className = 'text-green-600'>{Details.Payments.Email}</label></p>
                <p className = 'text-sm'>PaymentID :<label className = 'text-rose-600'>{Details.Payments.PaymentID}</label></p>
                <p className = 'text-sm'>Amount : <label className = 'text-orange-600'>${Details.Payments.Amount}</label></p>
                <p className = 'text-sm'>Date: <label className = 'text-red-600'>{Details.Payments.DateofPurchase}</label></p>
            </div>
        </div>
        <button className = 'px-3 py-2 border bg-green-500 text-white rounded-lg mt-12' onClick={DownloadPDF}>Download PDF</button>
        </div>
    )
}
export default Page 