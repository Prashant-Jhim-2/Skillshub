'use client'
import Image from 'next/image'
// Invoice Component 
    const Invoice = ({Details}) =>{
        return (
            <div className = 'flex flex-col items-center justify-center mt-6'>
                <h1>SkillsHub📝</h1>
                <label className='text-xs mb-6'>Invoice</label>
                <Image src = '/payment.jpg' width = {250} height = {250} alt = 'No Payments Found'/>
                <div className = 'flex flex-col items-start justify-center gap-2 bg-white  rounded-lg p-6 m-2'>
                <h1 className = 'text-sm'>Name of Course : {Details.CourseName}</h1>
                    <p className = 'text-sm'>Payment ID : {Details.PaymentID}</p>
                    <p className = 'text-sm'>Course ID : {Details.CourseID}</p>
                    <p className = 'text-sm'>Date Of Purchase : {Details.DateofPurchase} </p>
                    <p className = 'text-sm'>Currency : {Details.Currency}</p>
                    <p className = 'text-sm'>Amount ${Details.Amount}</p>
                    <p>Status : <label className = 'text-green-600'>{Details.status}</label></p>
                   
                </div>
            </div>
        )
    }

export default Invoice