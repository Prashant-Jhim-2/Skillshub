import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const UpdatePayment = async(Details)=>{
    const Requestforupdate = await fetch(`${process.env.NEXT_PUBLIC_PORT}/UpdatePayment`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({Details})
    })
    const Response = await Requestforupdate.json()
    
}
export const config = {
  api: {
    bodyParser: false, // Disable body parsing to get raw request body
  },
};

export async function POST(req) {
 const Request = await req.json()
 if (Request.type == "invoice.payment_succeeded"){
   const PaymentID = Request.data.object.subscription
   const invoice = Request.data.object 
   const PaymentDetails = {
    invoiceID : invoice.id ,
    Amount:invoice.amount_paid/100,
    url:invoice.hosted_invoice_url 
   }
   const nextpaymentdate = new Date(invoice.period_end * 1000)
   const Details = {
     id : PaymentID,
     data : PaymentDetails,
     Type:"Subscription",
     NextDate : nextpaymentdate
   }
   console.log(Details)
   const wait =  await UpdatePayment(Details)

 }
 
 if (Request.type == "checkout.session.completed"){
    const id = Request.id 
    const timestamp = Request.data.object.created 
    const date = new Date(timestamp * 1000);
    const localDate = date.getFullYear() + "-" + 
                 String(date.getMonth() + 1).padStart(2, "0") + "-" + 
                 String(date.getDate()).padStart(2, "0");




    const Amountwithoutcents = Request.data.object.amount_total / 100

    const Details = {
        id :Request.data.object.id ,
        Name:Request.data.object.customer_details.name,
        Email:Request.data.object.customer_details.email ,
        PaymentID:Request.data.object.payment_intent || Request.data.object.subscription,
        Amount:Amountwithoutcents,
        Currency:Request.data.object.currency,
        DateofPurchase : localDate,
        mode:Request.data.object.mode,
        Type : "Checkout"
    }
    const wait =  await UpdatePayment(Details)
  
   
 }
 if (Request.type == "payment_intent.succeeded"){
   
    const obj = Request.data.object
    const Details = {
        id :obj.id,
        Type:"Success"
    }
    
    setTimeout(async()=>{
        const wait = await UpdatePayment(Details)
    },8000)
    
 }

 return new Response(JSON.stringify({ id:'' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
