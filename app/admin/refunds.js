import Image from "next/image"
import { useEffect ,useState} from "react"

const Page = (props) =>{
    const [Details,ChangeDetails] = useState({Email:"",FullName:'',ImgSrc:""})
    const [Approved,ChangeStatus] = useState(props.Approved)
    // Function To Get Details of Profile using Profile ID 
    const CheckID = async() =>{
        console.log(props.ProfileID)
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Profile`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({id:String(props.ProfileID)})
        })
        const Response = await Request.json()
        if (Response.status == true){
            ChangeDetails(Response.data)
            return Response.data
        }
       if (Response.status == false){
        document.getElementById(`alert${props.id}`).style.display = 'flex'
       
       }
    }

    // UseEffect to Check Particular Application is Approved or Not 
    useEffect(()=>{
        if (Approved == 'Approved'){
            document.getElementById(`ApprovalBtns${props.id}`).style.display = 'none'
        }
        if (Approved == "Declined") {
            document.getElementById(`ApprovalBtns${props.id}`).style.display = 'none'
        }
    },[1])
    // Function to Display cancel Request 
    const CancelShow = (event) =>{
        const id = event.target.id 
        if (id == `CancelShow${props.id}`){
            document.getElementById(`ApprovalBtns${props.id}`).style.display = 'none'
            document.getElementById(`CancelBtns${props.id}`).style.display = 'flex'
            document.getElementById(`textarea${props.id}`).style.display = 'flex'
        }
        if (id == `BackShow${props.id}`){
            document.getElementById(`ApprovalBtns${props.id}`).style.display = 'flex'
            document.getElementById(`CancelBtns${props.id}`).style.display = 'none'
            document.getElementById(`textarea${props.id}`).style.display = 'none'
        }
    }
    // Function to Accept or Reject Refund 
    const AcceptorReject = async(event) =>{
        const id = event.target.id 
        if (id == `accept${props.id}`) {
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/RefundApproval/${props.id}`)
            const Response = await Request.json()
            if (Response.status == true){
                ChangeStatus("Approved")
                document.getElementById(`ApprovalBtns${props.id}`).style.display = 'none'
            }
            if (Response.status == false ){
                document.getElementById(`alert${props.id}`).style.display = 'flex'
            }
        }
        if (id == `reject${props.id}`) {
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/RefundCancel/${props.id}`)
            const Response = await Request.json() 
            if (Response.status == true){
                const reason = document.getElementById(`CancelReason${props.id}`).value 
                const domain = ''
                const Email  = Details.Email
                const Requestforemail = await fetch("/api/email",{
                    method:"POST",
                    headers:{"Content-Type":'application/json'},
                    body:JSON.stringify({email:Email,reason,Change:"Verify",domain,type:'refund'})
                })
                const Responseforemail = await Requestforemail.json()
                if (Responseforemail.status == true){
                    ChangeStatus("Declined")
                    document.getElementById(`CancelReason${props.id}`).value = ''
                    document.getElementById(`textarea${props.id}`).style.display = 'none'
                    document.getElementById(`CancelBtns${props.id}`).style.display = 'none'
                }
            }
        }
    }


    useEffect(()=>{ 
        CheckID()
    },[1])
    return (
        <div className = 'shadow-lg flex flex-col rounded w-80  p-3'>
            <h1 id = {`alert${props.id}`} className = 'animate-slidedown transition duration-200 w-full h-12 items-center justify-center hidden border border-black text-white bg-red-600'>Something Went Wrong</h1>
            <div className = 'w-full mt-3 flex flex-col justify-center items-center'>
                <div className = 'relative w-full h-60 items-center justify-center flex'>
                <Image className = 'w-full shadow-lg' objectFit="contain" src = {Details.ImgSrc} fill = {true} />
                </div>
                <h1 className = 'text-xl'>{Details.FullName}</h1>
                <h1 className = 'text-md text-rose-500'>{Details.Email}</h1>

            </div>
            <h1 className  = 'mt-3 text-sm'>PaymentID : {props.PaymentID}</h1>
            <h1 className = 'text-sm'>ProfileID : {props.ProfileID}</h1>
            <h1 className = 'flex flex-col border p-2 border-black rounded mt-3'>Reason : <strong className = 'text-sm text-rose-600'>{props.Reason}</strong></h1>
            <h1 className = 'w-44 shadow mt-3 p-3 gap-2 border flex items-center justify-center  self-center'>Status :     {Approved == 'Approved' && <strong className = 'text-green-600'>Approved</strong>} {Approved == "Declined" && <strong className = 'text-rose-600'>Declined</strong>} {Approved == "Pending" && <strong className = 'text-rose-600'> Pending</strong>}</h1>
            <div id = {`textarea${props.id}`} className  = 'w-full hidden flex-col mt-6 '>
                <label>Cancel Reason :</label>
                <textarea id = {`CancelReason${props.id}`} placeholder = "Enter The Reason" className = 'p-2 shadow-lg w-full border '/>
            </div>

            <div id = {`CancelBtns${props.id}`} className = 'hidden mt-2 gap-2'>
                <button id = {`reject${props.id}`} onClick = {AcceptorReject} className = 'text-white bg-rose-600 px-3 py-2  rounded'>Cancel Refund </button>
                <button onClick = {CancelShow} id = {`BackShow${props.id}`} className = 'text-white bg-black px-3 py-2  rounded'>Back</button>
            </div>
            
            <div id = {`ApprovalBtns${props.id}`} className = 'mt-6 flex gap-3'>
                <button id = {`accept${props.id}`} onClick = {AcceptorReject}  className = 'shadow-lg active:bg-white active:border active:border-green-600  active:text-green-600 px-3 py-2 bg-green-600 text-white rounded'>Accept Refund</button>
                <button onClick={CancelShow} id = {`CancelShow${props.id}`} className = 'text-rose-600'>Cancel</button>
            </div>
        </div>
    )
}
export default Page 