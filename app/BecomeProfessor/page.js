'use client'
import Image from "next/image"
import {useState,useEffect} from 'react'
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { VscArrowCircleLeft } from "react-icons/vsc";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
const Page = ()=>{
    const session = getSession()
    const Router = useRouter()
    const [User,ChangeUser] = useState(undefined)
    const [Details,ChangeDetails] = useState(undefined)
    const [Educationdetails,ChangeEducationDetails] = useState([])
    const [Certifications,ChangeCertifications] = useState([])
    const [Work,ChangeWork] = useState([])
    const [LocalFile,ChangeLocalfile] = useState(undefined)
    const [ImgSrc,ChangeImgSrc] = useState("https://unsplash.com/photos/2LowviVHZ-E/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzM5NzE3NjA2fA&force=true")
   
    // useEffect To Check User is Authenicate 
    const CheckAuth = async() =>{
        const data = await session 
        if (data == undefined){
            Router.push('/')
        }
        else {
            const user = data.user 
            
           
            // Part To Get User RealTime Data
           const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${user.id}`)
           const Response = await Request.json()
           if (Response.status == true){
            const Type = Response.Details.Type 
            ChangeImgSrc(Response.Details.ImgSrc)
            if (Type == "Professor"){
                Router.push('/home')
            }
          
        }
        }
      
    }

    useEffect(()=>{
     CheckAuth()
    },[])
    // Function to Go Back To HomePage 
    const GoBack = ()=>{
        Router.push("/home")
    }
    // Function to Generate Random ID 
    const GenerateRandom = () =>{
        // Length is Set to 6 
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''; 
        const arr = new Uint8Array(6)
        crypto.getRandomValues(arr)
        arr.forEach((num)=>{
            result += chars[num%chars.length]
        })
        return result
    }

    // Function to Upload The Image 
     // Part Of Uploading Image 
     const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_apiKey,
        authDomain:  process.env.NEXT_PUBLIC_authDomain,
        projectId:  process.env.NEXT_PUBLIC_projectId,
        storageBucket:  process.env.NEXT_PUBLIC_storageBucket,
        messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
        appId:  process.env.NEXT_PUBLIC_appId,
      };
      const app = initializeApp(firebaseConfig);
      const storage = getStorage(app);
      const db = getFirestore(app);
  
  
      // Function To Upload Image and Get ImgSrc 
      const UploadImg = async(File)=>{
        document.getElementById("Uploading").style.display = 'flex'
        const storageref = ref(storage,`photos/${File.name}`)
        await uploadBytes(storageref,File)
        const url = await getDownloadURL(storageref)
        document.getElementById("Uploading").style.display = 'none'
        setTimeout(()=>{
            document.getElementById("Uploading").innerHTML = 'Uploaded'
            document.getElementById("Uploading").style.display = 'flex'
            setTimeout(()=>{
                document.getElementById("Uploading").style.display = 'none'
                document.getElementById("Uploading").innerHTML = 'Uploading'


            },1000)
        },2000)
        return url 
     }
    // Function To Capture File in Local Instance 
    const CaptureLocal = (event)=>{
        const file = event.target.files[0]
        ChangeLocalfile(file)
        const url = URL.createObjectURL(file)
        ChangeImgSrc(url)
    }

    // Function To Send API Call 
    const SendRequest = async(Data)=>{
        const element = document.getElementById("Posting")
        window.scrollTo({top:element.offsetTop,behavior:"smooth"})
        document.getElementById("Post").disabled = true 
        document.getElementById("Posting").style.display = 'flex'
       
                // Api Call To Server to save data 
                const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/ProfessorApplication`,{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify({Data})
                })
                const Response = await Request.json()
                if (Response.status == true){
                    document.getElementById("Post").disabled = false 
                    document.getElementById("Posting").style.display = 'none'
                    setTimeout(()=>{
                        document.getElementById("Posting").innerHTML = 'Posted ✅'
                        document.getElementById("Posting").style.display = 'flex'
    
                        setTimeout(()=>{
                            document.getElementById("Posting").innerHTML = 'Posting...'
                            document.getElementById("Posting").style.display = 'none'
                            ClearValues("all")
                        },2000)
    
                    },3000)
    
                }
    }

    // Function To Continue Without Full Details 
    const ContinueWithout = () =>{
        if (Details != undefined){
            SendRequest(Details)
            document.getElementById("Warning").style.display = 'none'
        }
    }
    // Function To Post Professor Request 
    const PostRequest = async()=>{
        const FullName = document.getElementById("FullName").value || undefined
        if (FullName != undefined){
           
            var URL  = ImgSrc
           if (LocalFile != undefined ){
                URL = await UploadImg(LocalFile)
            }
            const Data = {
                idofuser:User.id ,
                Email:User.email || User.Email,
                Type:User.Type,
                FullName,
                ImgSrc:URL,
                Educationdetails,
                Certifications,
                Work,
                Approved:false
            }
            ChangeDetails(Data)
            if (Data.FullName != undefined && Data.ImgSrc != undefined && Data.Educationdetails.length != 0 && Data.Certifications != 0 && Data.Work != 0  ){
              SendRequest(Data)
              return 0
            }
            else {
                if (Data.FullName != undefined && Data.ImgSrc != undefined){
                   document.getElementById("Warning").style.display = 'flex'
                }
            }
        
        }
    }

    
    // Month Name Returner 
    const MonthName = (Value) =>{
        if (Value == 1){
            return "Jan"
        }
        if (Value == 2){
            return "Feb"
        }
        if (Value == 3){
            return "Mar"
        }
        if (Value == 4){
            return "Apr"
        }
        if (Value == 5){
            return "May"
        }
        if (Value == 6){
            return "Jun"
        }
        if (Value == 7){
            return "Jul"
        }
        if (Value == 8){
            return "Aug"
        }
        if (Value == 9){
            return "Sept"
        }
        if (Value == 10){
            return "Oct"
        }
        if (Value == 11){
            return "Nov"
        }
        if (Value == 12){
            return "Dec"
        }
    }

    // Function To Get Duration Time 
    const Durationtime = (startdate,enddate) =>{
  
        var start = new Date(startdate)
        var end = new Date(enddate) 
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        if (months < 0) {
            years -= 1;
            months += 12;
          }

          return { years, months };
    }
    // Card Component for Education and Work Experience
    const Card1 = (props) =>{
       
     
       const Duration = Durationtime(props.From,props.To)
    
       
       
        
        // Function to Delete the Card1
    const DeleteCard1 = ()=>{
        console.log(props.type)
        if (props.type == 'Ed'){
            const newarr = Educationdetails.filter((data)=>{
                if (data.idofcard != props.idofcard){
                    return data 
                }
            })
            ChangeEducationDetails(newarr)
        }
        if (props.type == 'Work'){
            const newarr = Work.filter((data)=>{
                if (data.idofcard != props.idofcard){
                    return data 
                }
            })
            ChangeWork(newarr)
        }
    }
        return (
            <div id = {props.idofcard} className = 'flex border mb-6 shadow-lg p-3 flex-col w-80'>
                <label>Name</label>
                <label className = 'text-blue-500'>{props.Name}</label>
                <label className = 'mt-3'>Institution / Company</label>
                <label className = 'text-blue-500'>{props.College}</label>
                <label className = 'mt-3'>City</label>
                <label className = 'text-blue-500'>{props.City}</label>
                <label className = 'mt-3'>From --- To</label>
                <label className = 'text-blue-500' >{props.FromDate} -- {props.ToDate}</label>

                <label className = 'mt-3'>Duration : <strong className ='text-sm text-rose-600'>{Duration.years} Yrs {Duration.months} Months</strong> </label>
                <button  onClick = {DeleteCard1} className = 'text-white rounded mt-3 self-start px-3 py-2 bg-rose-600'>Delete</button>
            </div>
        )
    }

    const Card2 = (props) =>{
        const DeleteCard = ()=>{
            const newarr = Certifications.filter((data)=>{
                if (data.idofcard != props.idofcard){
                    return data 
                }
            })
            ChangeCertifications(newarr)
        }
        return (
            <div id = {props.idofcard} className = 'flex mt-3 border shadow-lg p-3 flex-col w-80 '>
                <label>Name</label>
                <label className = 'text-blue-500'>{props.Name}</label>
                <label className = 'mt-6'>Valid Until</label>
                <label className = 'text-blue-500'>{props.ValidUntil}</label>
                <button onClick = {DeleteCard} className = 'bg-rose-600 px-2 py-2 text-white rounded mt-6 w-24'>Delete</button>
            </div>
        )
    }
  
    const ClearValues = (type) =>{
        if (type == 'Ed'){
            document.getElementById('NameofEd').value = ''
            document.getElementById("NameofCol").value= ''
            document.getElementById("NameofEdCity").value = ''
            document.getElementById("From").value = ''
            document.getElementById("To").value= ''
        
        }
        if (type == "Work"){
             document.getElementById('NameofRole').value = ''
             document.getElementById("NameofComp").value = '' 
           document.getElementById("NameofWorkCity").value  = ''
           document.getElementById("FromWork").value = ''
            document.getElementById("ToWork").value = ''
        }
        if (type == 'all'){
            document.getElementById("FullName").value = ''
            document.getElementById('NameofRole').value = ''
            document.getElementById("NameofComp").value = '' 
          document.getElementById("NameofWorkCity").value  = ''
          document.getElementById("FromWork").value = ''
           document.getElementById("ToWork").value = ''
           document.getElementById('NameofEd').value = ''
           document.getElementById("NameofCol").value= ''
           document.getElementById("NameofEdCity").value = ''
           document.getElementById("From").value = ''
           document.getElementById("To").value= ''
           document.getElementById("CertName").value = ''
           document.getElementById("ValidUntil").value = ''
           ChangeCertifications([])
           ChangeEducationDetails([])
           ChangeWork([])
           ChangeImgSrc('https://unsplash.com/photos/2LowviVHZ-E/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzM5NzE3NjA2fA&force=true')
        }
    }
    // Function To Add Card 
    const Add = (event) =>{
        const id = event.target.id 
        const Year = new Date().getFullYear()
       
        if (id == 'Ed'){
            // Part to Validate All Data 
            var Data = {
                idofcard : GenerateRandom(),
                type:id,
                Name:document.getElementById('NameofEd').value || undefined,
                College:document.getElementById("NameofCol").value || undefined,
                City:document.getElementById("NameofEdCity").value || undefined,
                From:document.getElementById("From").value || undefined ,
                To:document.getElementById("To").value || undefined,
            }

            const FromArr = Data.From.split("-") 
            const ToArr = Data.To.split("-")
            const FromDate = `${FromArr[2]} ${MonthName(parseInt(FromArr[1]))} ${FromArr[0]}`
            const ToDate = `${ToArr[2]} ${MonthName(parseInt(ToArr[1]))} ${ToArr[0]}`
            const From = new Date(Data.From)
            const todaydate = new Date()
            const To = new Date(Data.To)
            if (Object.values(Data).some(value => value === undefined)){
                document.getElementById("Ed").style.backgroundColor = 'crimson'
                document.getElementById("Ed").style.color = "white"
                document.getElementById("Ed").innerHTML = 'Invalid Data'
                document.getElementById("Ed").disabled = true 


               
                setTimeout(()=>{
                    document.getElementById("Ed").style.backgroundColor = 'black'
                    document.getElementById("Ed").style.color = 'white'
                    document.getElementById("Ed").innerHTML = 'Add'
                    document.getElementById("Ed").disabled = false 
                },2000)
            }


            else{
               
              
                if (parseInt(ToArr[0]) <= Year && parseInt(FromArr[0]) <= Year && To >= From && To <= todaydate){
                    
                    var Details = {...Data,FromDate,ToDate}
                    var prev = [...Educationdetails,Details]
                    ChangeEducationDetails(prev)
                    ClearValues(id)
                }
                else {
                    document.getElementById("Ed").style.backgroundColor = 'crimson'
                    document.getElementById("Ed").style.color = "white"
                    document.getElementById("Ed").innerHTML = 'Invalid Data'
                    document.getElementById("Ed").disabled = true 
    
    
                   
                    setTimeout(()=>{
                        document.getElementById("Ed").style.backgroundColor = 'black'
                        document.getElementById("Ed").style.color = 'white'
                        document.getElementById("Ed").innerHTML = 'Add'
                        document.getElementById("Ed").disabled = false 
                    },2000)
                }
                
               
            
           
            }
        }
        if (id == "Cert"){
            const Data = {
                type:"Cert",
                idofcard:GenerateRandom(),
                Name:document.getElementById("CertName").value || undefined ,
                ValidUntil:parseInt(document.getElementById("ValidUntil").value )|| undefined
            }
            if (Data.Name != undefined  && Data.ValidUntil != undefined && Data.ValidUntil >= Year){
                document.getElementById("CertName").value = ''
                document.getElementById("ValidUntil").value = ''
                const arr = [...Certifications,Data]
                ChangeCertifications(arr)
            }
        }
        if (id == "Work"){
            const Data = {
                idofcard : GenerateRandom(),
                type:id,
                Name:document.getElementById('NameofRole').value || undefined,
                College:document.getElementById("NameofComp").value || undefined,
                City:document.getElementById("NameofWorkCity").value || undefined,
                From:document.getElementById("FromWork").value || undefined ,
                To:document.getElementById("ToWork").value || undefined,
            }
            
            if (Object.values(Data).some(value => value === undefined)){
                document.getElementById("Work").style.backgroundColor = 'crimson'
                document.getElementById("Work").style.color = "white"
                document.getElementById("Work").innerHTML = 'Invalid Data'
                document.getElementById("Work").disabled = true 


               
                setTimeout(()=>{
                    document.getElementById("Work").style.backgroundColor = 'black'
                    document.getElementById("Work").style.color = 'white'
                    document.getElementById("Work").innerHTML = 'Add'
                    document.getElementById("Work").disabled = false 
                },2000)
            }


            else{
                const FromArr = Data.From.split("-") 
                const ToArr = Data.To.split("-")
                const FromDate = `${FromArr[2]} ${MonthName(parseInt(FromArr[1]))} ${FromArr[0]}`
                const ToDate = `${ToArr[2]} ${MonthName(parseInt(ToArr[1]))} ${ToArr[0]}`
                const From = new Date(Data.From)
                const todaydate = new Date()
                const To = new Date(Data.To)
                if (parseInt(ToArr[0]) <= Year && parseInt(FromArr[0]) <= Year && To >= From && To <= todaydate){
                   
                    var Details = {...Data,FromDate,ToDate}
                    var prev = [...Work,Details]
                    ChangeWork(prev)
                    ClearValues(id)
                }
            else {
                document.getElementById("Work").style.backgroundColor = 'crimson'
                document.getElementById("Work").style.color = "white"
                document.getElementById("Work").innerHTML = 'Invalid Data'


                ClearValues(id)
                setTimeout(()=>{
                    document.getElementById("Work").style.backgroundColor = 'black'
                    document.getElementById("Work").style.color = 'white'
                    document.getElementById("Work").innerHTML = 'Add'
                },2000)
            }
            }
            
        }
    }
    
    // Function for Clicking out 
    const clickout = ()=>{
        document.getElementById("file").click()
    }
    return (
        <div className = 'flex flex-col items-center justify-center'>
            <button onClick={GoBack} className = 'fixed active:text-rose-600 flex items-center justify-center gap-1 top-2 left-2'><VscArrowCircleLeft size={30} />Back</button>
            <label id = "Posting" className = 'text-white animate-slideDown bg-green-600 w-full h-12  hidden items-center gap-2 justify-center z-20 '>Posting....</label>
            <h1 className = 'text-2xl mt-6'>TryMyBoard📝</h1>
            <button id = "Post" onClick ={PostRequest} className = 'px-3 py-2 rounded  fixed top-2 right-2 bg-green-500 text-white'>Post</button>
          
            <h2>Professor Application</h2>
            <div id = "Warning" className = ' hidden flex-col animate-slideDown mt-6'>
            <label className = '  '>Continue Posting Without Complete Details</label>
          <div className = 'flex mt-2 gap-2 items-center justify-center'>
            <button onClick ={ContinueWithout} className = 'px-3 py-1 shadow-lg rounded border text-white bg-green-600'>Yes</button>
            <button className = 'px-3 py-1 shadow-lg rounded border text-white bg-rose-600'>No</button>
          </div>
           </div>
            <div className = 'flex mt-24 flex-col items-center justify-center'>
                <h3>Profile Photo</h3>
                <div className = 'w-64  '>
                    <Image 
                    src = {ImgSrc}
                    width={300}
                    height = {300}
                    />
                </div>
               <label id = "Uploading" className = 'w-64 h-12 bg-green-600 hidden animate-slideDown items-center justify-center text-white shadow-lg '>Uploading...</label>
                <input accept=".jpg, .jpeg"  id = "file" className = 'hidden' onChange={CaptureLocal}  type = 'file'  />
                <button onClick={clickout} className = 'bg-black active:bg-white active:text-black shadow-lg active:border active:border-black text-white px-3 py-2 rounded mt-3'>Upload</button>
                <label className = 'self-start  text-md mt-6'>FullName</label>
                <input id = "FullName" className = 'h-12 outline-black rounded  border border-black self-start w-80 p-2' type = 'text' placeholder = "Enter The FullName" />
                <label className = 'self-start mt-6 text-md'>Education Details</label>
                {Educationdetails.map((data)=><Card1 type = {data.type} id = {data.id} idofcard = {data.idofcard} Name = {data.Name} From = {data.From} FromDate={data.FromDate} To={data.To} ToDate = {data.ToDate} City = {data.City} College={data.College} />)}
                <div className = 'flex mt-6 flex-col gap-2 justify-start items-start '>
                    <input className = 'w-80 p-2 border border-black rounded h-12'  type = 'text' id = 'NameofEd' placeholder = 'Enter The Degree or Diploma Name' />
                    <input className = 'w-80  p-2 border border-black rounded h-12 ' type = 'text' id = 'NameofCol' placeholder = "Enter The Name of Institution" />
                    <input className = 'w-80  p-2 border border-black rounded h-12 ' type = 'text' id = 'NameofEdCity' placeholder = "Enter The Name of City" />
                    <label>From</label>
                    <div className = 'w-80 flex gap-2'>
                    <input id = "From" min = '1' max = '12' className = 'w-36  p-2 border border-black rounded h-12 ' type = 'date'  placeholder = "Month" />
                   </div>
                   <label>To</label>
                   <div className = 'w-80 flex gap-2'>
                    <input id = 'To' min = '1' max = "12" className = 'w-36  p-2 border border-black rounded h-12 ' type = 'date'  placeholder = "Month" />
                   </div>
                    <button id = "Ed" onClick = {Add} className = 'border border-black w-full px-3 py-2  rounded bg-black text-white'>Add</button>
                </div>

                <label className ='self-start mt-6'>Certifications</label>
                {Certifications.map((data)=><Card2  idofcard = {data.idofcard} id = {data.id} Name = {data.Name} ValidUntil = {data.ValidUntil}/>)}

                <label className = 'text-xs text-white m-3 border rounded bg-rose-600 border-black p-2'>Certifications need to be valid beyond current year</label>
                <input id = 'CertName' className = 'w-80  p-2 border border-black rounded h-12 ' type = 'text' placeholder = "Enter The Name of Certification" />
                <input id = "ValidUntil" className = 'w-80 p-2 border border-black rounded h-12 mt-3' type ='text' placeholder = 'Valid Until' />
                <button id = "Cert" onClick = {Add} className = 'mt-3 border border-black w-full px-3 py-2  rounded bg-black text-white'>Add</button>

                <label className = 'self-start mt-6'>Work Experience</label>
                {Work.map((data)=><Card1  id = {data.id} type = {data.type} idofcard = {data.idofcard} Name = {data.Name} From = {data.From}  To={data.To}  City = {data.City} College={data.College} />)}

                <input id = "NameofRole" className = 'w-80 mt-3 h-12 outline-black p-2 border border-black mb-3 rounded' type = 'text' placeholder = 'Enter The Role Name' />
                <input id ='NameofComp' className = 'w-80 h-12 outline-black p-2 border border-black rounded' type = 'text' placeholder = 'Enter The Company Name' />
                <input id ='NameofWorkCity' className = 'w-80 h-12 mt-3 outline-black p-2 border border-black rounded' type = 'text' placeholder = 'Enter The City Name' />
                <label className ='self-start mb-3 mt-6'>From</label>
                    <div className = 'w-80 flex gap-2'>
                    <input id = "FromWork" min = '1' max = '12' className = 'w-36  p-2 border border-black rounded h-12 ' type = 'date'  placeholder = "Month" />
                   </div>
                   <label className = 'mt-6 mb-3 self-start'>To</label>
                   <div className = 'w-80 flex gap-2'>
                    <input id = 'ToWork' min = '1' max = "12" className = 'w-36  p-2 border border-black rounded h-12 ' type = 'date'  placeholder = "Month" />
                   </div>
                <button id = "Work" onClick = {Add} className = ' mt-3 border border-black w-full px-3 py-2  rounded bg-black text-white'>Add</button>

            </div>
        </div>
    )
}

export default Page 