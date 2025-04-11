
import Image from "next/image"
import {useState,useEffect} from 'react'
import { useArrStore } from "./store/useStore"
const Card = (props)=>{
    const {ChangeUsers} = useArrStore()
    const [DelRequst,ChangeDelRequest]  = useState('flex')
    const [Approve,ChangeApprove] = useState(props.Approved)
    const [MiniType,ChangeMiniType] = useState("")
    const [Arr,ChangeArr] = useState(props.Educationdetails)
    const [Display,ChangeDisplay] = useState("hidden")
    const [DeleteDisplay,ChangeDeleteDisplay] = useState("hidden")
    const [CurrentType,ChangeType] = useState(props.Type)
    // Function to Assign User to be Professor 
    const Assign = async(event) =>{
        ChangeDisplay("flex")
        const id = event.target.id 
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Assign`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({id:props.idofuser,idofcard:props.id,Type:id})
        })
        const Response = await Request.json()
        if (Response.status == true ){
            ChangeDisplay("hidden")
            ChangeType(id) 
            ChangeApprove(true)
        }
    }

    useEffect(()=>{
        if (props.Approved == true){
            ChangeDelRequest("hidden")
        }
    },[])

    // Card Component  
    const MiniCard = () =>{
        if (MiniType == `Work${props.id}` || MiniType == `Ed${props.id}` ){
            return (
                <div className = 'flex flex-col gap-2'>
                    {Arr.map((data)=>{
                        return (
                            <div className = 'text-xs mb-3 shadow-lg border  p-3 flex flex-col'>
                            <label >{data.Name}</label>
                            <label >{data.College}</label>
                            <label >{data.City}</label>
                            <strong >{data.FromDate} -- {data.ToDate}</strong>
                         </div>
                        )
                    })}
                </div>
            )
        }
        if (MiniType == `Cert${props.id}`){
            return (
                <div className = "flex flex-col">
                   {Arr.map((data)=>{
                    return (
                        <div className = 'flex shadow-lg flex-col text-xs border p-3 '>
                            <label>{data.Name}</label>
                            <strong>Until : {data.ValidUntil}</strong>
                        </div>
                    )
                   })}
                </div>
            )
        }
    }
    const Delete =async()=>{
        ChangeDeleteDisplay("flex")
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/deleteuser/${props.id}`)
        const Response = await Request.json()
        if (Response.status == true){
            ChangeUsers(Response.data)
            ChangeDeleteDisplay("hidden")
           
        }
    }

    // Change Arr Functions 
    const Change = (event) =>{
        const id = event.target.id 
        document.getElementById(id).style.color = 'crimson'
        ChangeMiniType(id)
        if (id == `Ed${props.id}`){
            document.getElementById(`Cert${props.id}`).style.color = 'black'
            document.getElementById(`Work${props.id}`).style.color = 'black'
            ChangeArr(props.Educationdetails)
        }
        if (id == `Cert${props.id}`){
            document.getElementById(`Ed${props.id}`).style.color = 'black'
            document.getElementById(`Work${props.id}`).style.color = 'black'
            ChangeArr(props.Certifications)
        }
        if (id == `Work${props.id}`){
            document.getElementById(`Cert${props.id}`).style.color = 'black'
            document.getElementById( `Ed${props.id}`).style.color = 'black'
            ChangeArr(props.Work)
        }
    }

    // Approved or Not 
    const ApprovedOrNot = () =>{
        if (Approve){
            return (
                <> <h1 className = 'text-green-600'>Approved</h1></>
            ) 
        }
        else {
            return (
                <><h1 className = 'text-orange-600'>Pending</h1></>
            )
        }
    }
    return (
        <div className = 'relative  border py-6 px-12 shadow-lg  flex-col'>
           <h1  className = {`items-center  ${Display} h-12 bg-green-600 text-white border justify-center  w-full  `}> Updating..</h1>
            <h1 className = {`items-center ${DeleteDisplay} bg-rose-600  text-white justify-center h-12`}>Deleting...</h1>
            <div className = 'flex border items-center justify-center relative'>
                <Image
                src = {props.ImgSrc}
                width={120}
                height={120}
                />
            </div>
            <h1 className = 'text-sm mt-3'>FullName : {props.FullName}</h1>
            <h1 className = 'text-sm '>Email : {props.Email}</h1>
            <h1 className = 'text-sm mb-3'>Current : {CurrentType}</h1>
            <h1 className = 'flex px-2 py-2 shadow-lg border  items-center justify-center  gap-2 mb-3'>Status: <ApprovedOrNot/>  </h1>
            <label className  ='w-full flex items-center text-sm mb-3 justify-center'>Click To View </label>
            <div className = 'flex flex-col mb-6'>
            <button onClick = {Change} id = {`Ed${props.id}`} className = 'text-sm'>EductionDetails [{props.Educationdetails.length}]</button>
            <button onClick = {Change} id ={`Cert${props.id}`} className = 'text-sm'>Certifications [{props.Certifications.length}]</button>
            <button onClick = {Change} id = {`Work${props.id}`} className = 'text-sm mb-6 '>Work Experience [{props.Work.length}]</button>
            <MiniCard/>
            </div>
            <div className = 'gap-3 flex-col text-xs flex'>
                {CurrentType == "Customer" &&                 <button onClick={Assign} id = "Professor" className = 'px-3 text py-2 border active:bg-white shadow-lg active:text-black border-black rounded bg-black text-white'>Assign Professor</button>}
                {CurrentType == "Professor" &&                 <button onClick={Assign} id = "Customer" className = 'px-3 text py-2 border active:bg-white shadow-lg active:text-black border-black rounded bg-black text-white'>Assign Customer</button>}
                <button  onClick={Delete} className = {`text-rose-600 items-center justify-center ${DelRequst}`}>Delete Request</button>
            </div>
        </div>
    )
}
export default Card