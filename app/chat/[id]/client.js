'use client'
import { getSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { VscArrowCircleLeft } from "react-icons/vsc";
import {useRef} from 'react'
import {db} from './firebase'
import {storage} from './firestore(image)'
import { CgProfile } from "react-icons/cg";
import { BsFillSendFill } from "react-icons/bs";
import Image from 'next/image'
import {useState,useEffect,useMemo} from 'react'
import { doc, onSnapshot, updateDoc,serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Page = ({Responsefromserver}) =>{
  const params = useParams()
  const timeoutRef = useRef(null)
  let timeout ;
  let typingtimeout ;
 
  const [Online,changestatus] = useState(false)
  const [UserDetails,ChangeUserDetails] = useState({})
  const [Receiver,ChangeReceiver] = useState({FullName:''})
  const [TypingOrNot,ChangeTypingStatus] = useState(false)
  const [Chatdata,ChangeChatData] = useState([])
  const [PhotoFile,ChangePhotoFile] = useState(undefined)
  const [VideoFile,ChangeVideoFile] = useState(undefined)
  const [PhotoUrl,ChangePhotoUrl] = useState('')
  const Router = useRouter()
  const [Chats,ChangeChats] = useState(Responsefromserver.Data.Chat)
  const MemorizedChats = useMemo(()=>Chats,[Chats])
  const session = getSession()
  // Function To Check Authication 
  const CheckAuth = async() =>{
    const Session = await session 
    if (Session != undefined){
      const id = Session.user.id 
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${id}`)
      const Response = await Request.json()
      if (Response.status == true){
        ChangeUserDetails(Response.Details)
        if (id == Responsefromserver.Data.User1){
          const Requestforuser2 = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${Responsefromserver.Data.User2}`)
          const Responseforuser2 = await Requestforuser2.json()
          ChangeReceiver(Responseforuser2.Details)
        }
        if (id == Responsefromserver.Data.User2){
          const Requestforuser1 = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${Responsefromserver.Data.User1}`)
          const Responseforuser1 = await Requestforuser1.json()
          ChangeReceiver(Responseforuser1.Details)
        }
      }
      if (Response.status == false){
        Router.push("/")
      }
    }
    if (Session == undefined){
      Router.push('/')
    }
  }


   // Function To Change Whether User is Online or Offline 
   const OnlineorOffline = async(idofchat,lastseen) =>{
    const Session = await session 
    const idofuser = Session.user.id
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Online`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({idofchat,idofuser,lastseen})
    })
    const Response = await Request.json()
    
   }
   const updateseconds = async () => {
    if (timeoutRef.current) return; // Prevent duplicate intervals
    
    timeoutRef.current = setInterval(async () => {
      const nowseconds = Math.floor(Date.now() / 1000);
      await OnlineorOffline(params.id, nowseconds);
    }, 5000);
  };

 
  
  // Function to Broadcast Typing event 
  const Typing = async() =>{
    
    const Session = await session 
    const idofuser = Session.user.id 
    const idofchat = params.id 
   
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Typing`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({idofchat,idofuser,status:true})
    })
    const Response = await Request.json()

    if (typingtimeout) {
      clearTimeout(typingtimeout)
    }
    typingtimeout = setTimeout(async()=>{
       
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Typing`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({idofchat,idofuser,status:false})
  })
  const Response = await Request.json()
    },2000)
}

 
  //UseEffect to CheckAuth 
  useEffect(()=>{
    CheckAuth() 
    let unsubscribe ;
   
    const realtime = async() =>{
      const Session = await session 

   
    
    
    updateseconds()
   
    const id = Session.user.id 
   
    
    
   
   
    // Reference to the specific document
    unsubscribe = onSnapshot(
      doc(db, 'chats', params.id), // Specify your collection and document ID
      (snapshot) => {
        if (snapshot.exists()) {
          // Get data from snapshot and update state
          const data = snapshot.data()

          if (id == data.User1){
            const nowseconds = Math.floor(Date.now()/1000)
            const diff = nowseconds - data.User2LastSeen
            if (diff <= 10){
              changestatus(true)
            }
            if (diff > 10){
              changestatus(false)
            }
            if (data.NewMessages1 == true){
              document.getElementById("NewChat").style.display = 'flex'
            }
            if (data.NewMessages1 == false){
              document.getElementById("NewChat").style.display = 'none'
            }
            ChangeTypingStatus(data.User2Typing)
            
          }
          if (id == data.User2){
            const nowseconds = Math.floor(Date.now()/1000)
            const diff = nowseconds - data.User1LastSeen
            if (diff <= 10){
              changestatus(true)
            }
            if (diff > 10){
              changestatus(false)
            }
            if (data.NewMessages2 == true){
              document.getElementById("NewChat").style.display = 'flex'
            }
            if (data.NewMessages2 == false){
              document.getElementById("NewChat").style.display = 'none'
            }
            
            
            ChangeTypingStatus(data.User1Typing)
            
          }

          if (Chats.length  != data.Chat.length) {
            ChangeChats(data.Chat)
          }

          
        } else {
          console.log("Document not found");
        }
      },
      (error) => {
        console.error('Error fetching live updates:', error);
      }
      );
    }

    realtime()
      return () =>  {
         
        if (timeoutRef.current){
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        if (unsubscribe){
          unsubscribe();
        }
        
      }
    
  },[params.id])
 
  // Function to Scroll Up 
  const ScrollUp = async() =>{
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Seen`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({idofchat:params.id,idofuser:UserDetails.id})}
    )
    const Response = await Request.json() 
    if (Response.status == true){
        document.getElementById("BringUp").scrollIntoView({behavior:"smooth"})
        document.getElementById("NewChat").style.display = 'none'
    }
  }

  // Function to Give Date 
  const formatDate = (date) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-GB", options);
  
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
    const formattedTime = date.toLocaleTimeString("en-GB", timeOptions).toLowerCase();
  
    return `${formattedDate} : ${formattedTime}`;
  };


        
    
    
        // Function To Upload Image and Get ImgSrc 
        const UploadImg = async(UploadableFile)=>{
          const storageref = ref(storage,`photos/${UploadableFile.name}`)
          
          await uploadBytes(storageref,UploadableFile)
          const url = await getDownloadURL(storageref)
          return url 
       }
       
      
  // Function to Generate Random ID 
  const GenerateRandom = () =>{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 12; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
  const dateinformat = (date)=> {
    const day = date.getDate();
    const suffix =
      day % 10 === 1 && day !== 11 ? 'st' :
      day % 10 === 2 && day !== 12 ? 'nd' :
      day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  
    const hours = date.getHours();
    const isPM = hours >= 12;
    const formattedHour = hours % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = isPM ? 'pm' : 'am';
  
    return `${day}${suffix} ${months[date.getMonth()]} ${date.getFullYear()} ${formattedHour}:${minutes}${ampm}`;
  }
  
  // Function to Send Alert of New Message 
  const SendAlert = async (User,By,ChatID,Message,FullName,Email) => {
    const timestamp = dateinformat(new Date())
    const Details = {
      By,
      ByFullName:FullName,
      Page:`/chat/${ChatID}`,
      User,
      Type:"Chat",
      Message,
      time:timestamp
    }

    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/SendAlert`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(Details)
    })
    const Response = await Request.json()
    if (Response.status == true){
     const domain = `${window.location.origin}/alerts`
     console.log(Email,domain)
     const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/send-email`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email:Email,domain})
    })
    const Response = await Request.json()
    console.log(Response)
    }
  }
  // Send Chat 
  const Send = async() =>{
    const date = new Date()
    const datestring = formatDate(date)
    const value = document.getElementById("Chat").value 
    if (value != '' || PhotoFile != undefined || VideoFile != undefined){
      document.getElementById("Chat").value = ''
      var UploadableURLPhoto = ''
      var UploadableURLVideo = ''

      if (PhotoFile != undefined){
         UploadableURLPhoto = await UploadImg(PhotoFile)
      }
      if (VideoFile != undefined){
        UploadableURLVideo = await UploadImg(VideoFile)
      }
      // Part To Generate Random ID in order to help in Deleting 
      const idofchat = GenerateRandom()

      const Details = {
        idofchat:idofchat,
        id :UserDetails.id ,
        FullName:UserDetails.FullName,
        Chat : value ,
        Photo:UploadableURLPhoto,
        date:datestring
      }
      console.log(Details)
      console.log(UserDetails)
      const newarr = [...Chats,Details]
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/SendChat`,{
        method:"POST",
        headers:{"Content-Type":'application/json'},
        body:JSON.stringify({id : params.id,idofuser:UserDetails.id ,chat:newarr})
      })
      const Response = await Request.json()
      if (Response.status == true){
        SendAlert(Receiver.id,Details.id,params.id,value,Details.FullName,Receiver.Email)
        ChangeChats(newarr)
      }
      
      document.getElementById("PreviewPhoto").style.display = 'none'
      document.getElementById("Photo").innerHTML = 'Photo 📸'
      ChangePhotoFile(undefined)
      document.getElementById("BringUp").scrollIntoView({behavior:"smooth"})
      
    }
    
   
    

  }
  // Function to go to profile of user 
  const gotoprofile = () =>{
  Router.push(`/profile/${Receiver.id}`)
  }
  // Handle Change 
  const HandleChange = (event) =>{
    const id = event.target.id 
    const file = event.target.files[0];
    if (file) {
      
      ChangePhotoFile(file)
      const Reader = new FileReader()
      Reader.onload = () => {
        
        ChangePhotoUrl(Reader.result)
       
      }

      Reader.readAsDataURL(file)
      document.getElementById("PreviewPhoto").style.display = 'flex'

     }
   
   
  
  }
  
  // Upload Photo And Video 
  const UploadPhotoVideo = (event) =>{
    const id = event.target.id 
    if (id == 'Photo'){
      const innervalue = document.getElementById("Photo").innerHTML
     if (innervalue != 'Cancel ❌'){
      document.getElementById("UploadPhoto").click()
      document.getElementById("Photo").innerHTML = 'Cancel ❌'
     }
     else {
      document.getElementById("PreviewPhoto").style.display = 'none'
      document.getElementById("Photo").innerHTML = 'Photo 📸'
     }
    }
  }
  // Function to GoBack to Chats Page 
  const GoBack = () =>{
    Router.push('/chats')
  }

  // Chat Componet 
  const Chat = (props) =>{
    const Status = props.id == UserDetails.id 
    

    

    // Function to Delete the Chat 
    const Deleteforeveryone = async() =>{
      const id = props.idofchat 
      const newarr = Chats.filter((data)=>{
        if (id != data.idofchat){
          return data
        }
      })
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/DeleteChat`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:params.id,arr:newarr})
      })
      const Response = await Request.json()
      if (Response.status == true){
        ChangeChats(newarr)
      }

    }
      return (
        <div className ='mt-9  '>
          <div className = 'w-80 py-2  shadow-lg flex relative flex-col shadow  border-l-2 border-l-blue-500 flex flec-col '>
            <label className = 'ml-6 text-md'>{Status && <>Me </>} {!Status && <>{Receiver.FullName}</>}</label>
            <p className = 'text-xs mt-3 p-3   ml-3 whitespace-pre-line break-all w-full'>{props.Chat}</p>
            {props.Photo !=  ''  && <div className = 'relative h-80 mb-6   w-80'>
              <Image 
              className = 'z-10'
                 src =  {props.Photo}
                 alt = 'Chat Image'
               layout = 'fill'
               objectFit = 'contain'
               loading = 'lazy'
              />
            </div> }
            <label className = 'ml-3 absolute bottom-0 right-2 text-rose-600 text-[10px]'>{props.date}</label>
          </div>
         {Status && <button onClick = {Deleteforeveryone} id = {props.idofchat} className = 'text-rose-600 text-xs'>Delete for everyone</button>} 
          </div>
      )
    

    
  }
    return (
      <div className = 'flex  flex-col items-center justify-center'>
       
        <div className = ' flex z-30   fixed bg-white py-2 top-0 border-b w-full flex-col items-center justify-center '>
        <button onClick = {GoBack} className = 'absolute active:text-rose-600 flex items-center justify-center   top-2 left-2 '>
         <VscArrowCircleLeft size = {30}/> Back
        </button>
        <h1 className = 'text-2xl  '>Skillshub📝</h1>
          <button onClick = {gotoprofile} className = 'text-md active:rounded-lg flex  gap-2 items-center justify-center  active:bg-black active:text-white  px-3 py-2  mb-3  mt-3'><div className = 'relative w-12 h-12 '><Image className = 'rounded-full border shadow-lg   ' src = {Receiver.ImgSrc}  layout = 'fill' objectFit = 'contain'/></div>{Receiver.FullName}</button>
           <strong className = 'text-sm text-green-600'>{Online && <>🟢 Online</>} {!Online && <> 📵 Offline</>}</strong>
          
           <button onClick = {ScrollUp} id = 'NewChat' className = 'mt-3 border  hidden  text-sm px-3 py-2 rounded-lg shadow-lg text-red-600'>New Messages 💬</button>

        </div>

        <div className = 'relative pb-12 mt-48 mb-96'>

         {Chats.map((data)=><Chat idofchat = {data.idofchat} id = {data.id} Photo={data.Photo} FullName = {data.FullName} Chat = {data.Chat} date = {data.date} />)}
         <label id = 'BringUp'></label>
         {TypingOrNot && <label className = 'text-xs text-blue-600 mt-12'>{TypingOrNot && <>{Receiver.FullName} is Typing...</>}</label>}
        </div>
       
         

       
        <div className = 'fixed z-20 bg-white shadow-lg w-80  bottom-24 p-3 flex flex-col gap-3 border rounded items-center justify-center'>
          <div className = 'flex items-center justify-center'>
          <textarea onChange = {Typing} id = "Chat" className = 'items-center border-b border-b-black w-64  h-auto p-3 outline-none justify-center flex' placeholder = 'Text Anything' type = 'text' />
          </div>
          <div className = 'flex relative self-start w-full gap-3 ml-3'>
          <button onClick = {UploadPhotoVideo} id = "Photo" className = 'border text-xs active:shadow-none h-9 active:bg-black active:text-white active:border-black   px-3 py-2 rounded shadow-button'>Photo 📸</button>
          <button onClick= {Send} className ='border absolute bottom-0 right-4 rounded text-sm text-white active:bg-white h-9 active:border-black shadow-lg active:text-green-600 bg-green-600 flex gap-2 items-center justify-center px-3 py-2'> Send <BsFillSendFill size = {10} /></button>

         </div>
         <input onChange = {HandleChange} id = "UploadPhoto" accept="image/*" type = 'file' className = 'hidden' />
         <div  className = 'relative hidden border  shadow-lg w-80 h-80' id = "PreviewPhoto">
          <Image className = 'z-20' layout = 'fill' objectFit = 'contain' src ={PhotoUrl} />
         </div>
           </div>

        
      </div>
    )
}
export default Page 