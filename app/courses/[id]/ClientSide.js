'use client'
import Image from 'next/image';
import { useEffect ,useState} from 'react';
import {  useParams, useRouter } from 'next/navigation';
import { CiImageOn } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";

import { getSession } from 'next-auth/react';
import { LuTableOfContents } from "react-icons/lu";
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { loadStripe } from '@stripe/stripe-js';
import { TbSchool } from "react-icons/tb";

const Page = ({DataofCard}) =>{
  
    const params = useParams()
    const stripepromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    const Router = useRouter()
    const [UserDetails,ChangeUserDetails] = useState(undefined)
    const [Details,ChangeDetails] = useState(DataofCard)
    const session = getSession()
    // Function To Goback to Home 
    const BackToCourses = () =>{
        Router.push("/home")
    }
  
    // Function to Enroll in Course 
    const Enroll = async()=>{
      var Type 
      if (DataofCard.PriceType == "OneTime"){
        Type = 'payment'
      }
      if (DataofCard.PriceType == "Monthly"){
        Type ='subscription'
      }
      
      const Session = await session 
      const items = {name:DataofCard.Name,quantity:1,price:DataofCard.Price}
      const stripe = await stripepromise
      const request = await fetch('/api/checkout-session',{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({items,Type,SuccessURL:`${process.env.NEXT_PUBLIC_BASE_URL}/Course/${params.id}`,CancelURL:`${process.env.NEXT_PUBLIC_BASE_URL}/courses/${params.id}`})
      })
      const response = await request.json()
      console.log(response.id)
      const Details = {
        SessionID:response.id ,
        PaymentID:"",
        status : "Pending",
        CourseName:DataofCard.Name ,
        ProfileID:Session.user.id,
        CourseID:DataofCard.id,
        Name:"",
        Email:"",
        Payments:[],
        Amount:"",
        Currency:"",
        DateofPurchase:'',
        mode:"",
        Active:false
      }
      console.log(Details)
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/SuccessPayment`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(Details)
      })
      const Response = await Request.json()
      if (Response.status == true){
        await stripe.redirectToCheckout({sessionId:response.id})

      }
    }
   // Function To Check User is Login or Not
  const CheckAuth = async() =>{
    const Session = await session
    if (Details.ProfessorId == Session.user.id ){
      document.getElementById("Enrollbtn").style.display= 'none'
      document.getElementById("EditBtn").style.display= 'flex'
      document.getElementById('Course Content').style.display = 'flex'
    }
    if (Session.user == undefined){
      Router.push('/')
    }
    if (Session.user != undefined){
      const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetEnrolled/${session.user.id}`)
      const Response = await Request.json()
      if (Response.status == false){
        document.getElementById("Enrollbtn").style.display= 'none'
        document.getElementById('Course Content').style.display = 'flex'
      }

      return session.user 
      
    }
  }

  

  // Function To Switches Between The View when Card Details is not Fetched 
  const View = () =>{
     const [Display,ChangeDisplay] = useState("hidden")
     const [FormatArr,ChangeFormatArr] = useState(Details.Format)
     const [TechArr,ChangeTechArr] = useState(Details.Topics)
     const [CourseImg,ChangeCourseImg] = useState(Details.ImgSrc)
     const [ImgFile,ChangeImgFile] = useState(undefined)
     const [CourseLevel,ChangeCourseLevel] = useState(Details.Level)
    if (Details != undefined){
      // UseEffect To Check User is Professor or Normal User
      
      useEffect(()=>{
        CheckAuth()
        
      },[])

      // Function To Go to Video Page 
      const GotoContentPage = async() =>{
        const id = params.id 
       
          Router.push("/Course/"+ id)
        
      }
      // Function To Save Changes 
      const SaveChanges = async() =>{
        document.getElementById("Saving").style.display = 'flex'
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
        const UploadImg = async()=>{
          if (ImgFile != undefined){
            const storageref = ref(storage,`photos/${ImgFile.name}`)
          await uploadBytes(storageref,ImgFile)
          const url = await getDownloadURL(storageref)
          return url 
          }
          else {
            return undefined
          }
       }
      const url = await UploadImg()


        const NewDetails = {
          ImgSrc:url || Details.ImgSrc,
          Description : document.getElementById("Desc").value || Details.Description ,
          Duration : document.getElementById("Duration").value || Details.Duration,
          Level: CourseLevel,
          Format:FormatArr,
          Topics:TechArr,
          Price:document.getElementById("Price").value  || Details.Price

        }
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/UpdateCard`,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({id :params.id,data:NewDetails})
        })
        const Response = await Request.json()
        console.log(Response)
        
        if (Response.status == true){
          const Request2 =  await fetch(`${process.env.NEXT_PUBLIC_PORT}/Card/${params.id}`);
          const Response2 = await Request2.json()
         setTimeout(()=>{
          ChangeDisplay("hidden")
          // Fetch data server-side
          ChangeDetails(Response2.data)
         },2000)

        }
        
        
      }

      // Function to Delete The Course from Database
      const DeleteCourse = async()=>{
        
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/DeleteCourse/${params.id}`)
        const Response = await Request.json() 

        if (Response.status == true){
          Router.push('/home')
        }
      }

      // Function To Show Save and Cancel Button
  const ShowSave = (event) =>{
    const target = event.target.id
    
    console.log(target)
    if (target == 'EditBtnChild'){
      ChangeDisplay("flex")
      document.getElementById("SaveOrCancelBtn").style.display = 'flex'
      document.getElementById("EditBtnChild").style.display = 'none'
      document.getElementById("DeleteCourse").style.display ='flex'
      return 0
    }
    if (target == 'CancelBtn'){
      ChangeDisplay("hidden")
      document.getElementById("SaveOrCancelBtn").style.display = 'none'
      document.getElementById("EditBtnChild").style.display = 'flex'
      document.getElementById("DeleteCourse").style.display ='none'
      return 0
   
    }
  }
  
   // Image Upload Function
   const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file)
    if (file) {
     console.log(file)
     ChangeImgFile(file)
     const Reader = new FileReader()
     Reader.onload = () => ChangeCourseImg(Reader.result)
     Reader.readAsDataURL(file)
    }
  };

   // OnClick Function
   const OnClick = ()=>{
    document.getElementById("uploadfile").click()
   }

  // To Delete The Format or Technologies 
  const DelTechFormat = (event) =>{
    const valuetodelete = event.target.id 
    console.log(valuetodelete)
    const arrname = event.target.name 
    if (arrname == "Format"){
      var newarr = FormatArr.filter(item => item.Name !== valuetodelete)
      if (newarr.length != 0){
        ChangeFormatArr(newarr)
      }
      else {
        document.getElementById("FormatAlert").style.display = 'flex'
        document.getElementById("FormatAlert").innerText = "At Least One Format is Required"

        setTimeout(()=>{
          document.getElementById("FormatAlert").style.display = 'none'
        },2000)
      }
      
     
    }
    if (arrname == "Tech"){
      var newarr = TechArr.filter(item => item.Name !== valuetodelete)
     if (newarr.length != 0){
      ChangeTechArr(newarr)
     }
     else {
      document.getElementById("TechAlert").style.display = 'flex'
      document.getElementById("TechAlert").innerText = "At Least One Format is Required"

      setTimeout(()=>{
        document.getElementById("TechAlert").style.display = 'none'
      },2000)
    }
    }
  }
  // Function To Change Course Level 
  const ChangeLevelOfCourse = (event)=> {
    const id = event.target.id 
    ChangeCourseLevel(id)
    if (id == 'Beginner Friendly 👶'){
      document.getElementById(id).style.backgroundColor = '#1E90FF'
      document.getElementById("Intermediate Friendly 👦").style.backgroundColor = 'white'
      document.getElementById("Advanced Friendly 🧔🏻‍♂️").style.backgroundColor = 'white'
      document.getElementById("Intermediate Friendly 👦").style.color = 'black'
      document.getElementById("Advanced Friendly 🧔🏻‍♂️").style.color = 'black'
    }
    
    if (id == 'Intermediate Friendly 👦' ){
      document.getElementById(id).style.backgroundColor = '#1E90FF'
      document.getElementById("Beginner Friendly 👶").style.backgroundColor = 'white'
      document.getElementById("Advanced Friendly 🧔🏻‍♂️").style.backgroundColor = 'white'
      document.getElementById("Beginner Friendly 👶").style.color = 'black'
      document.getElementById("Advanced Friendly 🧔🏻‍♂️").style.color = 'black'
    
    
    }
    if (id == 'Advanced Friendly 🧔🏻‍♂️'){
      document.getElementById(id).style.backgroundColor = '#1E90FF'
      document.getElementById("Intermediate Friendly 👦").style.backgroundColor = 'white'
      document.getElementById("Beginner Friendly 👶").style.backgroundColor = 'white'
      document.getElementById("Intermediate Friendly 👦").style.color = 'black'
      document.getElementById("Beginner Friendly 👶").style.color = 'black'
    
    }
  }
  // Function To Push New Format or Tech 
  const PushTechFormat = (event) =>{
    const id =  event.target.id 
    console.log(id)
    console.log(id == "FormatBtn")
    if (id == "FormatBtn"){
      const value = document.getElementById("NewFormat").value 
      if (value != ""){
        const Details = {
          Name:value ,
          index:FormatArr.length 
        }
        console.log(Details)
        ChangeFormatArr([...FormatArr,Details])
        document.getElementById("NewFormat").value = ''
      }Alert: 
      if (value == ""){
        document.getElementById("FormatAlert").style.display = 'flex'
        document.getElementById("FormatAlert").innerText = "Cannot Pass Empty String 🚨"
  
        setTimeout(()=>{
          document.getElementById("FormatAlert").style.display = 'none'
        },2000)
      }
    }
    if (id == 'TechBtn') {
      const value = document.getElementById("NewTech").value 
      if (value != ""){
      const Details = {
        Name:value ,
        index:FormatArr.length 
      }
      ChangeTechArr([...TechArr,Details])
      document.getElementById("NewTech").value =''
    }
    if (value == ""){
      document.getElementById("TechAlert").style.display = 'flex'
      document.getElementById("TechAlert").innerText = "Cannot Pass Empty String 🚨"
      setTimeout(()=>{
        document.getElementById("TechAlert").style.display = 'none'
      },2000)
    }
  }
  }

  // Function to Navigate Professor Page 
  const Navigatetoprofessor = () =>{
    Router.push("/Professor/"+ Details.ProfessorId)
  }
     
      return (
        <div className = 'flex pb-24  pt-24 relative flex-wrap sm:flex-wrap md:flex-nowrap lg:flex-nowrap xl:flex-nowrap 2xl:flex-nowrap  items-center'>
            <h1 className = 'z-20  absolute text-2xl bg-white   text-center top-12 w-full'>Skillshub📝</h1>
            <button onClick = {BackToCourses} className = 'fixed z-30 top-2 left-2 text-lg'>⏪ Back to Courses </button>

            <p id = 'Saving' className = 'fixed justify-center items-center hidden top-0 z-30  bg-green-600  px-3 py-4 w-full transition-transform duration-500 ease-out animate-slideDown text-center text-white'>Saving...</p>
            
            <div className =' w-full h-[300px] sm:h-[300px] md:h-screen lg:h-screen xl:h-screen 2xl:h-screen relative mb-12 flex flex-col justify-center '>
                
                <Image
          src={CourseImg}
          alt="Course Thumbnail"
          layout = 'fill'
          objectFit="cover"
         
          className="shadow-lg z-10"
        />
        <input onChange = {handleImageChange} id = "uploadfile" type = 'file' accept="image/jpeg" className = 'hidden' />
        <button onClick = {OnClick} id = "ChangePhotobtn" className = {`absolute ${Display} items-center justify-center focus:bg-transparent text-white bg-black active:bg-white active:text-black opacity-75  px-3 py-2 w-full h-full  top-0 z-30 left-0`}><strong className = 'text-2xl flex w-full  text-center items-center justify-center gap-2'>Change <CiImageOn size={30} /></strong></button>
        </div>
        
               <div className = 'flex px-12 w-full gap-3 justify-center xl:items-center 2xl:items-center md:items-center sm:items-center xs:items-center lg:items-center flex-col '>
                <h2 className = 'text-3xl'>{Details.Name}</h2>
                <p>
                    <strong>Course Description : </strong>
                    {Details.Description}
                </p>
                <textarea id = "Desc" className = {`border border-black w-64 px-3 py-2 rounded ${Display}`} placeholder = 'Enter The Description'/>
                <p><strong>Course Duration :</strong> {Details.Duration} Weeks</p>
                <input id = 'Duration' type = 'number' className = {`w-64 px-3 py-2 border outline-blue-600 rounded border-black  ${Display}`} placeholder = 'How Many Weeks' />
                <p><strong>Course Level :</strong> {CourseLevel}</p>
                <div className = {`w-64 border border-black  ${Display} flex-col`}>
                  <button id = "Select Status" className = 'w-full bg-black text-white border h-12'>Select The Status</button>
                  <button onClick = {ChangeLevelOfCourse} id = "Beginner Friendly 👶" className = 'w-full hover:bg-black  hover:text-white h-12'>Beginner Friendly 👶</button>
                  <button onClick = {ChangeLevelOfCourse}  id = "Intermediate Friendly 👦" className = 'w-full hover:bg-black  hover:text-white h-12'>Intermediate Friendly 👦</button>
                  <button onClick = {ChangeLevelOfCourse} id = "Advanced Friendly 🧔🏻‍♂️" className = 'w-full hover:bg-black  hover:text-white h-12'>Advanced Friendly 🧔🏻‍♂️</button>
                </div>
                <p><strong>Course Format :</strong>{FormatArr.map((data)=><>  {data.Name}   </>)}</p>
                <div className = {`flex gap-3 flex-col  ${Display}`}>
                {FormatArr.map((data)=><div className = 'flex gap-2 w-full text-center items-center justify-center'>{data.Name} <button onClick = {DelTechFormat} name= "Format" id = {data.Name} className = ' active:bg-white active:border active:border-black active:text-black   px-2 rounded bg-rose-600 text-white py-2'>Remove</button>  </div>)}
                <div className = 'flex mt-6 mb-6 gap-1 items-center  rounded justify-center'>
                  <input id = "NewFormat" className = 'w-56 h-12 border-b    px-2 py-1 border-b-black outline-black ' type = 'text' placeholder = "Enter The Format" />
                 <button onClick = {PushTechFormat} id = "FormatBtn"  className = ' bg-black text-white px-2 py-1 active:bg-white active:border active:border-black active:text-black h-12 '>Add</button>
                </div>
                <p id = "FormatAlert" className = 'w-full hidden items-center justify-center text-center text-white bg-rose-400 text-sm px-3 py-2  rounded'>Alert: Cannot Pass Empty String 🚨</p>
                </div>
                <p><strong>Technologies Covered :</strong>{TechArr.map((data)=><>  {data.Name} </>)}</p>
                <div className = {`flex flex-col gap-3  ${Display}`}>
                {TechArr.map((data)=><div className = 'flex gap-2 items-center justify-center'>{data.Name} <button  name= "Tech"  onClick = {DelTechFormat} id = {data.Name} className = 'border border-black px-2 rounded bg-rose-600 text-white py-2'>Remove</button>  </div>)}
                <div className = 'flex mt-6 mb-6 gap-1 items-center  rounded justify-center'>
                  <input id = "NewTech" className = 'w-56 h-12 border-b    px-2 py-1 border-b-black outline-black ' type = 'text' placeholder = "Enter The Technologies" />
                  <button onClick = {PushTechFormat} id = "TechBtn"  className = ' bg-black text-white px-2 py-1 active:bg-white active:border active:border-black active:text-black h-12 '>Add</button>
                </div>
                <p id = "TechAlert" className = 'w-full hidden items-center justify-center  text-center text-white bg-rose-400 text-sm px-3 py-2  rounded'>Alert: Cannot Pass Empty String 🚨</p>

                </div>
                <p>Price : ${Details.Price} (Canadian Dollars) </p>
                <input id = "Price" type = 'number' className = {`border border-black outline-blue-600 w-64 px-3 py-2 rounded  ${Display}`} placeholder = "Enter The Price " />
                <button onClick={Enroll} id = "Enrollbtn" className = 'bg-rose-600 text-white text-xl transition duration-200 active:translate-y-1 hover:ring-2 hover:ring-rose-300  px-4 py-2 rounded-lg'>Enroll</button>
                <div id = "EditBtn" className = 'hidden mt-6 w-full items-center justify-center  items-start justify-center  flex flex-col'>
                  <button onClick = {ShowSave} id = "EditBtnChild" className = 'flex border shadow-lg border-black px-2 py-2  text-center rounded gap-2  text-md'>Edit <FaRegEdit size = {25} /></button>
                  <div id = "SaveOrCancelBtn" className = ' hidden w-full items-center justify-center flex gap-2 '>
                    <button onClick = {SaveChanges} className = 'px-3 py-2 border border-black rounded bg-green-600 text-white'>Save </button>
                    <button onClick = {ShowSave} id = "CancelBtn" className = 'text-rose-600'>Cancel</button>
                  </div>
                  <button onClick = {DeleteCourse} id = "DeleteCourse" className = 'rounded hidden active:bg-white active:text-rose-600 active:border active:border-black items-center justify-center mt-6 text-white bg-rose-600 px-3 py-2'>Delete Course</button>
                </div>

                <button id = 'Course Content' onClick = {GotoContentPage} className = 'hidden gap-2 mt-6 items-center active:text-rose-600  justify-center'> <LuTableOfContents size={30} /> Course Content </button>
               <div className = 'mt-12 items-center justify-center flex flex-col gap'>
                <h1>About Professor</h1>
                <div onClick = {Navigatetoprofessor} className = 'flex flex-col items-center justify-center border  p-2 border-black rounded shadow-lg '>
                <h2><TbSchool size = {40} /></h2>
                <button >Prashant Kumar</button>
      
                </div>
      
       
               </div>
                </div>
            
        </div>
    )
    }

    if (Data == undefined){
     return (
      <div className = 'flex flex-col'>
        <h1 className = 'z-20 absolute text-2xl bg-white   text-center top-3 w-full'>Skillshub📝</h1>
            <button onClick = {BackToCourses} className = 'fixed z-30 top-2 left-2 text-lg'>⏪ Back to Courses </button>
            
      <div className = 'flex mt-24 animate-jump  mt-24 flex-col mt-12 items-center text-2xl'>
      Loading.....
      <div className="flex items-center justify-center h-24">
        <div className="relative w-80 max-w-md h-12 bg-gray-300 rounded-full overflow-hidden">

         <div className="absolute w-80 h-12 bg-blue-500 rounded-full animate-slide"></div>
      </div>
      </div>
      </div>
      </div>
     )
    }
  }

  return (
    <>
    <View/>
   
    </>
  )
    
    
}
export default Page