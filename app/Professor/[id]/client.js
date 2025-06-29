'use client'
import Image from "next/image"
import { CiEdit } from "react-icons/ci";

import {useState,useEffect} from 'react'
import { VscArrowCircleLeft } from "react-icons/vsc";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
const Page = ({details}) =>{
   const Router = useRouter()
   const Session = getSession()
   const [Type,ChangeType] = useState("Info")
   const [Arr,ChangeArr] = useState([])
   
   
   
   // Card 1 for displaying the Education and Work 
    const Card1 = (props) =>{
       
        const [Editable,ChangeEditable] = useState(false)
        const [Editable2,ChangeEditable2] = useState(false)
        const [Date1,ChangeDate1] = useState(props.From)
        const [Date2,ChangeDate2] = useState(props.To)
        const [Date1Text,ChangeDate1Text] = useState(props.FromDate)
        const [Date2Text,ChangeDate2Text] = useState(props.ToDate)
     
        // Function To Change Tag to Editable 
        const MakeItEditable = () =>{
            if (Editable == false){
                ChangeEditable(true)
                document.getElementById(`EditBtn${props.id}`).style.display = 'none'
                document.getElementById(`btn${props.id}`).style.display = 'flex'
                document.getElementById(`alert${props.id}`).style.display = 'flex'
                document.getElementById(`Name${props.id}`).style.border = '1px solid black'
                document.getElementById(`Name${props.id}`).style.marginBottom = '10px'
                document.getElementById(`College${props.id}`).style.marginBottom = '10px'
                document.getElementById(`City${props.id}`).style.marginBottom = '10px'
                document.getElementById(`College${props.id}`).style.border = '1px solid black'
                document.getElementById(`City${props.id}`).style.border = '1px solid black'
                document.getElementById(`datediv${props.id}`).style.display = 'flex'

    
                return 0 
            }
            
        }

       
        // Function to check whether user is professor or not 
        const checkauth = async()=>{
        const session = await Session 
        const idofuser = session.user.id 
        const idofprofessor = details.Info.id 
        if (idofprofessor == idofuser){
            document.getElementById(`EditBtn${props.id}`).style.display = 'flex'
        }

   }

   // useeffect function to callon rendering 
   useEffect(()=>{
    checkauth()
   })
        // Function to Get Name of Month 
        const MonthName = (value) =>{
            const date = value.split("-")
            const year = parseInt(date[0])
            const monthno = parseInt(date[1])
            const Date  = parseInt(date[2])

            if (monthno == 1){
                return `${Date} Jan ${year}`
            }
            if (monthno == 2){
                return `${Date} Feb ${year}`
            }
            if (monthno == 3){
                return `${Date} Mar ${year}`
            }
            if (monthno == 4){
                return `${Date} Apr ${year}`
            }
            if (monthno == 5){
                return `${Date} May ${year}`
            }
            if (monthno == 6){
                return `${Date} Jun ${year}`
            }
            if (monthno == 7){
                return `${Date} Jul ${year}`
            }
            if (monthno == 8){
                return `${Date} Aug ${year}`
            }
            if (monthno == 9){
                return `${Date} Sept ${year}`
            }
            if (monthno == 10){
                return `${Date} Oct ${year}`
            }
            if (monthno == 11){
                return `${Date} Nov ${year}`
            }
            if (monthno == 12){
                return `${Date} Dec ${year}`
            }

        }
        // Function To Cancel The Editing 
        const Cancel = () =>{
            document.getElementById(`EditBtn${props.id}`).style.display = 'none'
            document.getElementById(`btn${props.id}`).style.display = 'none'
            ChangeEditable(false)
            document.getElementById(`EditBtn${props.id}`).style.display = 'flex'
            document.getElementById(`alert${props.id}`).style.display = 'none'
            document.getElementById(`Name${props.id}`).style.border = '0px '
            document.getElementById(`Name${props.id}`).style.marginBottom = '0px'
            document.getElementById(`College${props.id}`).style.marginBottom = '0px'
            document.getElementById(`City${props.id}`).style.marginBottom = '0px'
            document.getElementById(`College${props.id}`).style.border = '0px'
            document.getElementById(`City${props.id}`).style.border = '0px'
            document.getElementById(`datediv${props.id}`).style.display = 'none'


        }
        // Hear Changes 
        const DateinChange = (event) =>{
            const id = event.target.id 
            if (id == `firstdate${props.id}`){
                ChangeDate1(event.target.value )
                var seconddate = document.getElementById(`seconddate${props.id}`).value 
                
                const newdate = event.target.value 
                const value = MonthName(newdate)
                ChangeDate1Text(value)
            }
            if (id == `seconddate${props.id}`){
                ChangeDate2(event.target.value )
                const newdate = event.target.value 
                const value = MonthName(newdate)
                ChangeDate2Text(value)
            }
        }

        // Function To Update The Details 
        const UpdateDetails = async() =>{
            document.getElementById(`alert${props.id}`).innerHTML = 'Updating...'
           
            if (props.Type == "Ed" && props.Type == "Work"){
            const date1 = document.getElementById(`firstdate${props.id}`).value
            const date2 = document.getElementById(`seconddate${props.id}`).value
            const FromDate = MonthName(date1)
            const ToDate = MonthName(date2)
            const Details = {
                idofcard:props.idofcard,
                type:props.Type,
                Name : document.getElementById(`Name${props.id}`).innerHTML ,
                College : document.getElementById(`College${props.id}`).innerHTML,
                City:document.getElementById(`City${props.id}`).innerHTML,
                From : document.getElementById(`firstdate${props.id}`).value ,
                To : document.getElementById(`seconddate${props.id}`).value ,
                FromDate:FromDate,
                ToDate:ToDate
            }
            console.log(Details)
           
            // Callout Part to Send Changes in Databases to Server 
            const SendChange = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Changes`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({id:props.id,data:Details,Type:props.Type})
            })
            const Response = await SendChange.json()
            if (Response.status == true){
                document.getElementById(`alert${props.id}`).innerHTML = 'Updated'
                setTimeout(()=>{
                    document.getElementById(`alert${props.id}`).innerHTML = 'Click on Details To Change'
                    document.getElementById(`alert${props.id}`).style.display = 'none'
                    document.getElementById(`btn${props.id}`).style.display = 'none'
                    ChangeEditable(false)
                    document.getElementById(`firstdate${props.id}`).style.display = 'none'
                    document.getElementById(`seconddate${props.id}`).style.display = 'none'
                    document.getElementById(`EditBtn${props.id}`).style.display = 'flex'
                    document.getElementById(`Name${props.id}`).style.border = '0px'
                    document.getElementById(`Name${props.id}`).style.marginBottom = '0px'
                    document.getElementById(`College${props.id}`).style.marginBottom = '0px'
                    document.getElementById(`City${props.id}`).style.marginBottom = '0px'
                    document.getElementById(`College${props.id}`).style.border = '0px'
                    document.getElementById(`City${props.id}`).style.border = '0px'
                    document.getElementById(`datediv${props.id}`).style.display = 'none'
    
                },2000)

            }
           }


           if (props.Type == 'Cert'){
            const Details = {
                idofcard : props.idofcard ,
                type:props.Type  ,
                Name : document.getElementById(`Name${props.id}`).innerHTML ,
                ValidUntil:document.getElementById(`ValidUntil${props.id}`).innerHTML 
            }
            console.log(Details)
            // Callout Part to Send Changes in Databases to Server 
            const SendChange = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Changes`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({id:props.id,data:Details,Type:props.Type})
            })
            const Response = await SendChange.json()
            if (Response.status == true){
                document.getElementById(`alert${props.id}`).style.display = 'none'
                document.getElementById(`Name${props.id}`).style.border = '0px'
                document.getElementById(`ValidUntil${props.id}`).style.border = '0px'
                document.getElementById(`btn${props.id}`).style.display = 'none'
                ChangeEditable2(false)
            }
           }
        }
        if (props.Type == "Ed" || props.Type == "Work"){
            return (
                <div className = ' relative w-96 flex border shadow-lg flex-col mt-6    items-start justify-start'>
                    <h1 id = {`alert${props.id}`} className ='h-12 hidden items-center justify-center w-full bg-green-600 text-white animate-slidedown'>Click on Details To Change </h1>
                    <div className = 'w-full relative'>
                    <button id = {`EditBtn${props.id}`} onClick = {MakeItEditable} className = ' text-black hidden   px-2 py-1  rounded bg-white absolute top-2 right-2'> Edit <CiEdit size = {20} /></button>
                        <Image src = 'https://unsplash.com/photos/ORDz1m1-q0I/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fHN0dWR5fGVufDB8fHx8MTc0MDIzOTMxMXww&force=true' width = {400} height = {400} />
                    </div>
                    
                    <div className = 'px-2 py-2 mb-6'>
                   
                    <h1 id = {`Name${props.id}`} contentEditable = {Editable} className = 'px-3   outline-black text-lg'>{props.Name}</h1>
                    <h3 id = {`College${props.id}`} contentEditable = {Editable} className = 'px-3 outline-black'>{props.College}</h3>
                    <h3 id = {`City${props.id}`} contentEditable = {Editable} className = 'px-3 outline-black '>{props.City}</h3>
                    <h3 className = 'text-rose-600  px-3'><label onClick={DateinChange} id = "firstdate">{Date1Text}</label> - <label onClick={DateinChange} id = "seconddate">{Date2Text}</label> </h3>
                    <div id = {`datediv${props.id}`} className = 'hidden gap-2 items-center justfify-center text-sm px-2'>
                    <input onChange={DateinChange} id = {`firstdate${props.id}`} value = {Date1}  className = 'flex h-12 border px-2' type = 'date' />
                    
                    <input onChange={DateinChange} id = {`seconddate${props.id}`} value = {Date2} className = 'flex h-12 px-2 border' type = 'date'/>
                    </div>
                    <div id = {`btn${props.id}`} className = 'hidden gap-2 px-3 mt-3'>
                        <button onClick = {UpdateDetails} className = 'px-3 py-2 bg-green-600 text-white rounded'>Save</button>
                        <button onClick = {Cancel} className = 'text-white bg-rose-600 px-3 py-2 rounded'>Cancel</button>
                    </div>
                   
                    </div>
                </div>
            )
        }

        if (props.Type == "Cert"){
           
    
            // Part to Change Certifications Part 
            const ChangeCerifications = () =>{
               if (Editable2 == false){
                document.getElementById(`Name${props.id}`).style.border = '1px solid black'
                document.getElementById(`ValidUntil${props.id}`).style.border = '1px solid black'
                document.getElementById(`btn${props.id}`).style.display = 'flex'
                document.getElementById(`EditBtn${props.id}`).style.display = 'none'
                document.getElementById(`alert${props.id}`).style.display = 'flex'
                ChangeEditable2(true)
                return 0
               }
               if (Editable2 == true){
                document.getElementById(`Name${props.id}`).style.border = '0px'
                document.getElementById(`ValidUntil${props.id}`).style.border = '0px'
                document.getElementById(`btn${props.id}`).style.display = 'none'
                document.getElementById(`EditBtn${props.id}`).style.display = 'flex'
                document.getElementById(`alert${props.id}`).style.display = 'none'
                ChangeEditable2(false)
                return 0
               }

            }
           return (
            <div className = 'mt-6 border shadow-lg flex flex-col items-center justify-center'>
            <h1 id = {`alert${props.id}`} className = 'h-12 hidden items-center animate-slidedown transition duration-200 justify-center w-full bg-green-600 text-white'>Click on Details To Change </h1>
           
            <div className = 'w-full relative'>
                <button onClick = {ChangeCerifications} id = {`EditBtn${props.id}`}  className = ' text-black flex   px-2 py-1  rounded bg-white absolute top-2 right-2'> Edit <CiEdit size = {20} /></button>
                    <Image src = 'https://unsplash.com/photos/ORDz1m1-q0I/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTR8fHN0dWR5fGVufDB8fHx8MTc0MDIzOTMxMXww&force=true' width = {400} height = {400} />
            </div>
            <div className = 'flex mb-12 py-3 flex-col px-3 w-full items-start justify-start'>
                <h1 id = {`Name${props.id}`} contentEditable = {Editable2} className = ' w-64 p-3 text-xl '>{props.Name}</h1>
                <h1 className = 'ml-3 mt-6'>Valid Until : <strong className = 'w-64 p-3 mt-6' id = {`ValidUntil${props.id}`} contentEditable = {Editable2}>{props.ValidUntil}</strong></h1>
            </div>
            <div className = 'hidden mb-6  self-start ml-3 gap-3' id  = {`btn${props.id}`}>
                <button onClick = {UpdateDetails} className = 'px-3 py-2 active:border-black active:bg-white shadow-lg active:text-green-600 rounded border bg-green-600 text-white'>Save</button>
                <button onClick = {ChangeCerifications} className = 'text-white bg-rose-600 active:bg-white active:text-rose-600 active:border active:border-black rounded border px-3 py-2 '>Cancel</button>
            </div>
        </div>
           )
        }
    }
    // View Component 
    const View = ()=>{
        console.log(Arr)
        // Function to Change Arr Acc to Click 
        const ClickToChange = (event) =>{
            const id = event.target.id 
            if (id == 'ed'){
                ChangeArr(details.CareerDetails.Education)
            }
            if (id == 'work'){
                ChangeArr(details.CareerDetails.Work)

            }
            if (id == 'cert'){
                ChangeArr(details.CareerDetails.Certifications)
            }
        }
        if (Type == "Info"){
            return (
                <div className = 'flex mb-24 flex-col items-center justify-center'>
                    <div className = 'flex flex-wrap gap-2'>
                    <button onClick={ClickToChange} id = 'ed' className = 'bg-red-600 shadow-button px-3 py-2 text-white text-xs rounded'>Education 📚 ( {details.CareerDetails.Education.length} )</button>  
                    <button  onClick={ClickToChange} id = 'cert' className = 'bg-violet-600 px-3 py-2 text-white text-xs  rounded'>Certifications 📃 ( {details.CareerDetails.Certifications.length} )</button>  
                    <button onClick={ClickToChange} id = 'work' className = 'bg-orange-600 rounded px-3 text-white text-xs  py-2'>Work👨🏻‍💻 ( {details.CareerDetails.Work.length} )</button>
                    
                    </div>  
                    {Arr.map((data)=><Card1 idofcard = {data.idofcard} id = {details.CareerDetails.id} ValidUntil={data.ValidUntil} Type = {data.type || 'Cert' } City={data.City} College = {data.College} From = {data.From} FromDate = {data.FromDate} Name={data.Name} To={data.To} ToDate={data.ToDate} />)}              
                </div>
            )
        }
    }

    // Function to Goback to homepage 
    const goback = ()=>{
        Router.push('/home')
    }
    return (
        <div className = 'flex flex-col items-center justify-center'>
            <button onClick={goback} className = 'fixed flex items-center justify-center active:text-rose-600 z-30 bg-white px-3 py-2 rounded top-2 left-2'><VscArrowCircleLeft size={30} /> Back</button>
            
            <h1 className = 'text-2xl mt-6'>TryMyBoard📝</h1>
            <p className = 'text-sm'></p>
            <p className = 'text-sm'>Professor Profile👨🏻‍💻</p>

            <div id = "ProfileImage" className = ' flex flex-col items-center justify-center mt-12'>
                <div className = 'relative  border border-black'>
                    <Image src = {details.Info.ImgSrc} width={300} height = {300} />
                </div>
                <h2>{details.Info.FullName}</h2>
                <label className = 'text-sm text-rose-600'>{details.Info.Email}</label>
            </div>

           <button className = 'mt-6 mb-6 border border-black  px-2 py-2 active:bg-black active:text-white rounded shadow-lg'>Chat with Professor 👨🏻‍🏫</button>

            <div id = "Buttons" className = 'mt-6 mb-6 flex items-center justify-center gap-2'>
                <button className = 'border border-black px-4 py-1 rounded bg-black text-white'>Info</button>
                <button className = 'border border-black px-4 py-1 rounded '>Courses</button>
            </div>
            <View/>
           
        </div>
    )
}
export default Page 