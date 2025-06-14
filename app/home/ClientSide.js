'use client'
import {useState} from 'react'
import {motion} from 'framer-motion'
const validator = require("email-validator")
import { getSession,signIn ,signOut} from 'next-auth/react';
import { LuSend } from "react-icons/lu";
import { FcGoogle } from 'react-icons/fc'
import { MdFiberNew } from "react-icons/md";
import { X } from 'lucide-react' 
import { LuMessagesSquare } from "react-icons/lu";
import { RiLoginBoxLine } from "react-icons/ri";
import { useRouter } from 'next/navigation';
import Image from 'next/image'
import { Search } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, where} from "firebase/firestore";
import {db} from './firebase'
import { BiMessage } from "react-icons/bi";
import { IoIosLogOut } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import { MdOutlineAddBox } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { TiThMenuOutline } from "react-icons/ti";
import { FaRegWindowClose } from "react-icons/fa";
import { useEffect } from "react"
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdOutlinePayments } from "react-icons/md";
import Card from './Card'
import Link from 'next/link';
import { GoAlert } from "react-icons/go";

const page = ({carddata}) =>{
    const Router = useRouter()
    const [AlertDisplay,ChangeAlertDisplay] = useState('hidden')
    const [isOpentxt,ChangeisOpentxt] = useState("Menu")
    const [LoginSuccess,ChangeLoginSuccess] = useState(false)
    const [LoginSuccessDisplay,ChangeLoginSuccessDisplay] = useState(false)
    const [DisplayofModule,ChangeDisplayofModule] = useState(false)
    const [ifLoginOrSignup,ChangeLoginOrSignup] = useState("Login")
    const [Enrolled,ChangeEnrolled] = useState([])
    const [QueryinCard,ChangeQueryinCard] = useState('')
    const [isOpen, setIsOpen] = useState(false);
    const [EmailisInUse,ChangeEmailisInUse] = useState(true)
    const [ForgetPassDisplay,ChangeForgetPassDisplay] = useState(false)
    const [ForgetPassText,ChangeForgetPassText] = useState(false)
    const [Text,ChangeText] = useState('Link Sent Successfully 📧')
    const [SignupDisabled,ChangeisDisabled] = useState(false)
    const [Details,ChangeDetails] = useState(undefined)
    const session = getSession();
    const [Cards,ChangeCards] = useState(carddata)
    const [MenuBtn,ChangeMenuBtn] = useState(<>Menu <TiThMenuOutline  size={30}/></>)
    
   console.log(Cards)
    
     
  // Function To Get Enrolled Courses 
  const GetEnrolled = async(id) =>{
   
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetEnrolled/${id}`)
    const Response = await Request.json()
    console.log(Response)
    if (Response.status == true){
       const filtered =   Response.data.map((data)=> data.CourseID)
       ChangeEnrolled(filtered)
      }
    if (Response.status == false){
      ChangeEnrolled([])
    }
  }

    const CheckAuth = async() =>{
        const data = await session
        console.log(data)
        ChangeCards(carddata)
        
        if (data != undefined){
            
            
            GetEnrolled(data.user.id)
            
            document.getElementById("Courses").style.backgroundColor = 'black'
            document.getElementById("Courses").style.color = 'white'
            document.getElementById("Enrolled").style.backgroundColor = 'white'
            document.getElementById("Enrolled").style.color = 'black'
           
          

           // Part To Get User RealTime Data
           const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${data.user.id}`)
           const Response = await Request.json()
           console.log(Response.Details)
           if (Response.status == true){
           
            const Type = Response.Details.Type 
            console.log(Type)
            if (Type == "Customer"){
              document.getElementById('AddCourse').style.display = 'none'
            }
            if (Type == "Professor"){
              document.getElementById('BecomeProfessor').style.display = 'none'

            }
            ChangeDetails(Response.Details)
            
           }
           
        }
    }

    
    console.log(Cards)
    useEffect(()=>{

      console.log('i m useeffect')
     
        CheckAuth()
        var unsubscribe = ()=>{}
     const call = async() =>{
        var FirstCheck = false
        const Session = await session 
        const user = Session.user.id 
        console.log(user)
        const q = query(collection(db,'alerts'),where("User","==",user))
        unsubscribe = onSnapshot(q,(snapshot)=>{
            const newarr = snapshot.docs.map(doc=>({
                id:doc.id,
                ...doc.data()
            }))

            
             if (FirstCheck == false){
              ChangeAlertDisplay("hidden")
              FirstCheck = true
             }
             else {
              ChangeAlertDisplay("flex fixed")
              setTimeout(()=>{
                ChangeAlertDisplay("hidden")
              },5000)
             }
              
            
           
          
           
        })
     }
     call()

     
     return () => unsubscribe()
    },[])

   

   // Google Function 
 const SignwithGoogle = async()=>{
      const result =  signIn("google",{callbackUrl: '/home'})
      if (result?.error){
   ChangeLoginSuccess(false)
   ChangeLoginSuccessDisplay(true)

   setTimeout(()=>{
    ChangeLoginSuccessDisplay(false)
    document.getElementById("LoginBtn").disabled = false
   },2000)
  }
 }
  // Function To Fetch Data 
 const Login = async() =>{
  document.getElementById("LoginBtn").disabled = true
  const Result = await signIn("credentials",{
    redirect:false,
    Email:document.getElementById("Email").value ,
    Password:document.getElementById("Password").value
  })
  console.log(Result)
  if (Result?.error){
   ChangeLoginSuccess(false)
   ChangeLoginSuccessDisplay(true)

   setTimeout(()=>{
    ChangeLoginSuccessDisplay(false)
    document.getElementById("LoginBtn").disabled = false
   },2000)
  }
  else{
    if (Result?.ok == true){
      ChangeLoginSuccess(true)
      ChangeLoginSuccessDisplay(true)
      document.getElementById("LoginBtn").disabled = false
      
      setTimeout(()=>{
        ChangeDisplayofModule(false)
         ChangeLoginSuccess(false)
      ChangeLoginSuccessDisplay(false)
      Router.push('/')
       setTimeout(()=>{ 
        Router.push('/home')
       },500)
      

      },2000)
    }
  }
  
}
    
      
   
   // Function To Change Cards Arr ( Enrolled or Courses)
   const ChangeCardsArr = (event) =>{
    const id = event.target.id 
    if (id == "Enrolled"){
        document.getElementById("Enrolled").style.backgroundColor = 'black'
        document.getElementById("Enrolled").style.color = 'white'
        document.getElementById("Courses").style.backgroundColor = 'white'
        document.getElementById("Courses").style.color = 'black'
        const EnrolledCards = Cards.map((data)=>{
          if (Enrolled.includes(data.id)){
            return data
          }
        })
       ChangeCards(EnrolledCards)

    }
    if (id == "Courses"){
        document.getElementById("Courses").style.backgroundColor = 'black'
        document.getElementById("Courses").style.color = 'white'
        document.getElementById("Enrolled").style.backgroundColor = 'white'
        document.getElementById("Enrolled").style.color = 'black'
        ChangeCards(carddata)



    }
    
   }

    // Logout Function 
    const Logout = async()=>{
        await signOut({callbackUrl:"/home"})
    }
    // Go To Profile Page 
    const GotoProfile = async() =>{
        const data = await session
        Router.push("/profile/" + data.user.id)
    }
   
    // Function To AddCourse 
    const AddCourse = () =>{
       Router.push("/CreateCourse")
    }


   
    // Function To Open And Close Menu
    const OpenOrClose = () =>{
      
        if (isOpen == false){
            setIsOpen(true)
            ChangeisOpentxt("Close")
            ChangeMenuBtn(<>Close <FaRegWindowClose size={30}/> </>)
            return 0
        }
        if (isOpen == true){
            ChangeisOpentxt("Menu")
            setIsOpen(false)
            ChangeMenuBtn(<>Menu <TiThMenuOutline  size={30}/></>)
            return 0
        }
    }
   
   
    const GoToChat = () =>{
      Router.push('/chats')
    }
    const GoToalert = () =>{
      Router.push('/alerts')
    }

    const GoToBecProfessor = ()=>{
      Router.push("/BecomeProfessor")
    }
    const GotoPurchases = () =>{
      Router.push("/purchases")
    }




     // Function to Check Email already Exist in Database 
    const EmailInDbornot = async()=>{
        const value = document.getElementById("Email").value 
        console.log(value)
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckEmail`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({Email:value})
        })
        const Response = await Request.json()
        if (Response.status == true){
            return false
        }
        if (Response.status == false){
            return true
        }
    }
    // Email Validator 
    const EmailValidator = async () =>{
        const value = document.getElementById("Email").value 
        const Status = validator.validate(value) 
        const Check = await EmailInDbornot()
        console.log(Status,Check)
        if (Status == true && Check == true){
            ChangeEmailisInUse(true)
            return true
            
        }
        if (Status == false || Check == false){
            if (value == ""){
                if (ifLoginOrSignup == "Signup"){
                  ChangeEmailisInUse(false)
                  return false
                }
            }
            if (ifLoginOrSignup == "Signup"){
                  ChangeEmailisInUse(false)
                  return false
                }
        }
        
    }

    // Function to Send Email and Create Account 
    const Signin = async()=>{
        const validate = await EmailValidator()
        if (validate == true){
          ChangeisDisabled(true)
       
        const domain = window.location.origin
        const Email  = document.getElementById("Email").value 
        const Request = await fetch("/api/email",{
            method:"POST",
            headers:{"Content-Type":'application/json'},
            body:JSON.stringify({email:Email,Change:"Verify",domain,type:'verify'})
        })
        const Response = await Request.json()
        if (Response.status == true){
        // this Part Changed The style
        
        setTimeout(()=>{
            ChangeisDisabled(false)
        },2000)
        }
        }
    }

    // Function To Send Link To Email for Forget Password
  const SendLink = async() =>{
    
    const Value = document.getElementById("Email").value
    const domain = window.location.origin 
    const Check = await EmailInDbornot()
    if (Value != '' && Check == false){
      const Request = await fetch(`/api/email`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:Value,domain,type:"forget"})
      })
      const Response = await Request.json()
      console.log(Response)
      if (Response.status == true){
        ChangeForgetPassText(true)
        ChangeText("Link Sent Successfully 📧")

        setTimeout(()=>{
          ChangeForgetPassText(false)
        },2000)
      }
      else {
        ChangeForgetPassText(true)
        ChangeText("Something Wrong 🙅‍♂️")
         setTimeout(()=>{
          ChangeForgetPassText(false)
        },2000)
      }
    }
    else {
      ChangeForgetPassText(true)
      ChangeText("User Donot Exist ❌")
      setTimeout(()=>{
        ChangeForgetPassText(false)
      },2000)
    }
  }

    
    return (
      <div className="flex relative flex-col items-center">
        <title>Educorner Tutoring📝</title>
        <div className={`${AlertDisplay} items-center justify-center top-0 z-10 left-0 animate-moveDownFade text-white h-12 bg-red-500 w-full `}>
          <nav><Link href='/alerts'><button className='flex gap-2 items-center justify-center'>New Messages <BiMessage  size = {15}/></button></Link></nav>
        </div>
        <div id = "AlertNotify" className="fixed z-20 shadow-sm bg-white  p-4 flex w-full">
          <h1 className="text-xl font-bold">Educorner 📖</h1>
          {Details != undefined &&           <button onClick={OpenOrClose} className="fixed flex gap-3   z-12 top-2 p-3 text-lg right-2">{MenuBtn}</button>
}
          {Details == undefined && <div className = 'fixed flex  gap-2 text-sm items-center justify-center top-3 right-2'>
           <motion.button

           onClick={(()=>{
           ChangeLoginOrSignup("Login")
             ChangeDisplayofModule(true)
           })}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-2 bg-black flex items-center gap-2 justify-center text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
    
    >
      Login<RiLoginBoxLine size={15} />
    </motion.button>
            <label>/</label>
            <motion.button
            isDisabled = {SignupDisabled}
             onClick={(()=>{
            ChangeLoginOrSignup("Signup")
             ChangeDisplayofModule(true)
           })}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-2 bg-rose-600 flex gap-2 items-center justify-center text-white  font-semibold rounded-lg shadow-sm hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
     
    >
      Signup<MdFiberNew size={15} />
    </motion.button>
          </div>}
        </div>


       {        DisplayofModule &&   <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
         
        >
          <motion.div
            className="bg-white  relative flex flex-col items-center justify-center rounded-lg p-8 w-80 shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          // Prevent closing on modal click
          >
            <motion.button

            onClick={()=>{
              ChangeDisplayofModule(false)
            
            }}
      whileHover={{ scale: 1.2, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300 }}
      
      className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:text-black"
      aria-label="Close"
    >
      <X size={20} />
    </motion.button>
            {LoginSuccessDisplay &&  <label id = "LoginSuccess" className={`${LoginSuccess ? "text-white bg-green-600 mb-6 rounded-lg p-2" : "text-white bg-rose-600 p-2 rounded-lg mb-6"}`}>{LoginSuccess ? "Login Successfull 🎉" : "Something Wrong 🙅‍♂️"}</label>}


            {ForgetPassText == true && <label className='text-green-600 mt-3 mb-3 '>{Text}</label>}
            {SignupDisabled && <label className='text-red-600'>Please Wait...</label>}
            <div className = 'flex gap-2 items-center justify-center mb-4'>
              <button

              onClick={()=>{
                ChangeLoginOrSignup("Signup")
              }}
            layoutId="toggle"
            className={`p-2 ${ifLoginOrSignup == "Login" ? 'text-black bg-white' :'text-white bg-black' }   p-2 rounded-lg font-bold`}
          
          >
            Signup
        </button>
        <label>/</label>
       <button
        onClick={()=>{
                ChangeLoginOrSignup("Login")
              }}
            layoutId="toggle"
          className={`p-2 ${ifLoginOrSignup == "Signup" && 'text-black bg-white'}  ${ifLoginOrSignup == "Login" && 'text-white bg-black'} p-2 rounded-lg font-bold`}
           
          >
            Login
        </button>


            </div>
           
            <input onChange={EmailValidator} id = "Email" className='w-3/4 h-12 text-sm p-2 rounded-lg outline-black  bg-white border ' type = 'text' placeholder='Enter The Email : ' />
            {!EmailisInUse &&  <label className = 'mt-3 text-sm mb-3'>Email is Invalid ❌</label>}
          {(ifLoginOrSignup == "Login" && ForgetPassDisplay == false ) && <>
           <input id = "Password" className='w-3/4 h-12 mt-3 text-sm p-2 rounded-lg outline-black  bg-white border ' type = 'text' placeholder='Enter The Password: ' />
           {ForgetPassDisplay == false && <button
           onClick={()=>{
            ChangeForgetPassDisplay(true)
           }}
           
           className='text-sm mt-3 font-bold text-rose-600'>Forget Password</button>}
          </>}

          {(ForgetPassDisplay && ifLoginOrSignup == "Login") && <button
          onClick={()=>{
            ChangeForgetPassDisplay(false)
          }}
          className='text-sm mt-3 mb-3 font-bold text-rose-600'>Back To Login </button>}
          
           { ifLoginOrSignup == "Signup" && <motion.button onClick={Signin}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-2 mt-6 bg-rose-600 mb-3 flex gap-2 items-center justify-center text-white  font-semibold rounded-lg shadow-sm hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
     
    >
      Create Account <MdFiberNew size={15} />
    </motion.button>}
   {(ForgetPassDisplay && ifLoginOrSignup == "Login") &&  <motion.button 
      onClick={SendLink}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-2 mt-6 bg-rose-600 mb-3 flex gap-2 items-center justify-center text-white  font-semibold rounded-lg shadow-sm hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
     
    >
      Send Link  <LuSend size={15} />
    </motion.button>}
    { (ifLoginOrSignup == "Login" && ForgetPassDisplay == false) &&  <motion.button
      id = "LoginBtn"
      onClick={Login}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-2 mt-6 bg-black mb-3 flex gap-2 items-center justify-center text-white  font-semibold rounded-lg shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-black"
     
    >
     Login <RiLoginBoxLine size={15} />
    </motion.button>}

            <label>OR</label>
           {ifLoginOrSignup == "Signup" &&  <motion.button
           onClick={SignwithGoogle}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="flex items-center mt-3 justify-center gap-3 w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-black font-medium hover:bg-gray-50"
  
    >
      <FcGoogle size={22} />
      Sign up with Google
    </motion.button>}

{ifLoginOrSignup == "Login" &&   <motion.button
      onClick={SignwithGoogle}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="flex items-center mt-3 justify-center gap-3 w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-black font-medium hover:bg-gray-50"
  
    >
      <FcGoogle size={22} />
      Login with Google
    </motion.button>}

    
           
          </motion.div>
        </motion.div>}





        <div className="relative">
          <div
            className={`fixed z-20 top-[60px] border-0 border-t flex flex-col gap-2 items-center right-0 w-full h-full xl:w-96 2xl:w-96 lg:w-96 xs:w-full sm:w-full text-black bg-white transform ${
              isOpen ? "translate-x-0" : "translate-x-full"
            } transition-transform duration-300 ease-in-out`}
          >
            <ul className="text-2xl w-full justify-center items-center flex flex-col py-6">
              <li onClick={GotoProfile} className="mb-4 bg-white cursor-pointer text-center flex hover:text-blue-400 gap-2">
                <CgProfile size={30} /> Profile
              </li>
              <li id="AddCourse" onClick={AddCourse} className="mb-4 cursor-pointer bg-white text-center flex gap-2 py-3 hover:text-orange-300">
                <MdOutlineAddBox size={30} /> Add Course
              </li>
              <li id="BecomeProfessor" onClick={GoToBecProfessor} className="mb-4 cursor-pointer bg-white items-center justify-center text-center flex gap-2 py-3 hover:text-blue-300">
                <FaChalkboardTeacher size={30} /> Become Professor
              </li>
              <li id="Purchases" onClick={GotoPurchases} className="mb-4 cursor-pointer bg-white items-center justify-center text-center flex gap-2 py-3 hover:text-red-600">
                <MdOutlinePayments size={30} /> Purchases
              </li>
              <li id="Messages" onClick={GoToChat} className="mb-4 cursor-pointer bg-white items-center justify-center text-center flex gap-2 py-3 hover:text-blue-300">
                <LuMessagesSquare size={30} /> Messages
              </li>
              <li onClick={GoToalert} className="mb-4 bg-white cursor-pointer text-center flex hover:text-red-600 gap-2">
                <GoAlert  size={30} /> Alerts
              </li>
              <li onClick={Logout} className="mb-4 flex text-rose-600 cursor-pointer gap-2 text-center py-3">
                <IoIosLogOut size={30} /> Logout
              </li>
            </ul>
          </div>

          {isOpen && (
            <div
              onClick={() => {
                setIsOpen(false);
                ChangeisOpentxt("Menu");
              }}
              className="fixed z-10 top-14 inset-0 bg-black opacity-35"
            ></div>
          )}
        </div>

        
      <label className='mt-36 text-6xl'>📖</label>
       <h1 className = 'font-bold    text-center text-xl mb-12'>Welcome to <label className='text-orange-600'>Educorner </label><label className='text-blue-600'>Tutoring📝</label></h1>
      
      <p className='w-3/4 text-md overflow-hidden break-words '> At The <strong>EduCorner Tutoring</strong>, we’re passionate about learning—and even more passionate about helping others learn. We believe that every student deserves access to high-quality, personalized learning—anytime, anywhere. We’re a tutoring platform dedicated to helping students reach their academic goals with the support of expert tutors, interactive tools, and a flexible learning environment.

     Whether you're looking for help with a tough math problem, preparing for an important exam, or just want to get ahead in class, our team is here to guide you every step of the way. With one-on-one sessions, tailored lesson plans, and a focus on building confidence, we make learning easier, more effective, and even enjoyable.</p>
       
       <button className='border border-black p-3 mt-6 active:bg-black active:text-white rounded font-bold shadow-lg'>Meet Your Tutor 👨🏻‍🏫</button>


        <label className='mt-12 mb-6 text-4xl gap-3 font-bold'>We Offer 📄</label>
       <div className='flex flex-wrap gap-6 justify-center '>
        <div className='flex flex-col items-center justify-center'>
          <Image src = 'https://static.wixstatic.com/media/11062b_fd36cdacc882443194a30e8802b34e22~mv2.jpg/v1/crop/x_1065,y_0,w_4260,h_4260/fill/w_400,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_fd36cdacc882443194a30e8802b34e22~mv2.jpg' 
          width={300} height={300} alt = 'img' className=''/>
          <label className='text-xl'>In Home Tutoring</label>
        </div>
         <div className='flex flex-col items-center justify-center'>
          <Image src = 'https://static.wixstatic.com/media/11062b_d9d4937c4aac4201b88e5b12208c0f13~mv2.jpeg/v1/crop/x_1791,y_0,w_4270,h_4268/fill/w_400,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Online%20Class%20Teaching.jpeg' 
          width={300} height={300} alt = 'img' className=''/>
          <label className='text-xl'>Online Tutoring / Testing</label>
        </div>

       </div>

       <motion.div  
       initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true }} className=' w-full flex flex-col pb-12 pt-12  items-center justify-center mt-12'>
        <h1 className='font-bold text-4xl'>Why Choose Us ?</h1>
        <ul className='flex list-disc w-80 text-md flex-col gap-3 mt-6'>
         <li><strong>Expert Tutors:</strong> Carefully vetted professionals passionate about teaching</li>

<li><strong>Flexible Scheduling:</strong>  Learn at your pace, on your time</li>

<li><strong>Customized Learning: </strong> Personalized support that fits your unique learning style</li>

<li ><strong>Safe & Secure:</strong> A trusted platform for students and parents alike</li>
        </ul>


       
       </motion.div>
  <h1 className='font-bold text-3xl'>Subjects</h1>
        <div className="mt-6 mb-6 flex gap-3 text-xl">
        
          <button id="Enrolled" onClick={ChangeCardsArr} className="hover:border hover:bg-black py-2 hover:text-white px-3 rounded-lg">
            Enrolled
          </button>
          <button id="Courses" onClick={ChangeCardsArr} className="hover:border hover:bg-black py-2 hover:text-white px-3 rounded-lg">
            Courses
          </button>
        </div>

        <div className="mb-6 border  items-center justify-center h-16 shadow-lg text-lg rounded-lg w-80 flex gap-3 text-xl">
        <Search />
          <input
            type="text"
            placeholder="Search courses..."
            className=" h-full outline-none"
            value={QueryinCard}
            onChange={(e) => {
              const query = e.target.value.toLowerCase();
              ChangeQueryinCard(query);
              const filteredCards = carddata.filter((card) =>
                card.Name.toLowerCase().includes(query)
              );
              ChangeCards(filteredCards);
            }}
          />
        </div>

        {Cards.length > 0 && Enrolled.length >= 0  && 
        <div className='flex flex-wrap gap-6 justify-center'>
          {Cards.map((data) => {
            console.log(data)
            if (data != undefined){
              const details = Details || {id:'Nothinginthere'}
              const condition = Enrolled.includes(data.id);
              const verify = details.id == data.ProfessorId
              console.log(`Name : ${data.Name}`)
              console.log(`Already Enrolled ${condition} and Verify ${verify}`)
              console.log(verify)
              
            return (
            <Card Verify = {verify} enrolled = {condition}  data={data} />
            )
            }
          })}



         

         
        </div>
        
}

        <label className='mt-16 font-bold text-4xl'>Plans & Pricing</label>

        <p className='w-3/4 mt-6 text-xl break-words overflow-hidden'>We offer flexible and affordable tutoring options designed to fit every student’s needs and schedule. Whether you need help with one tricky subject or ongoing support throughout the year, we've got a plan for you.

</p>
        <div className='flex flex-wrap gap-6 justify-center mt-6'>
          
          <div className='flex w-80 border p-8 rounded shadow-lg flex-col items-center justify-center'>
            <Image
            src='https://static.wixstatic.com/media/11062b_885da9ad8310478c9d21a904700f3922~mv2.jpg/v1/fill/w_121,h_121,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Hands%20and%20Diamond.jpg'
            width={100}
            height={100}
            />
            <h1>Premium Plan </h1>
            <h1 className='font-bold mb-4'>$349*</h1>
            <p>For students who want intensive support & fast results</p>
            <ul className='list-disc text-sm flex flex-col  items-start justify-center gap-2 mt-6'>
              <li>Priority scheduling</li>
              <li>3-4 tutoring sessions/week  (12 sessions/month)</li>
              <li>1-hour sessions</li>
              <li>Dedicated tutor match</li>
              <li>Homework help + exam prep</li>
              </ul>
          </div>

           <div className='flex w-80 border p-8 rounded shadow-lg flex-col items-center justify-center'>
            <Image
            src='https://static.wixstatic.com/media/11062b_9c09611a6512466c90f9ac8ecf632c52~mv2.png/v1/fill/w_121,h_121,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Gold-Striped%20Decorative%20Sphere.png'
            width={100}
            height={100}
            />
            <h1>Standard Plan  </h1>
            <strong>(most popular)</strong>
            <h1 className='font-bold mb-4'>$249*</h1>
            <p>Ideal for weekly academic support</p>
            <ul className='list-disc text-sm flex flex-col  items-start justify-center gap-2 mt-6'>
              <li>2-3 tutoring sessions/week</li>
              <li>(8 sessions/month)</li>
              <li>1-hour sessions</li>
              <li>Assignment/Homework help</li>
             
              </ul>
          </div>

           <div className='flex w-80 border p-8 rounded shadow-lg flex-col items-center justify-center'>
            <Image
            src='https://static.wixstatic.com/media/nsplsh_6dbb72aec7754a3c981433216dde4972~mv2.jpg/v1/crop/x_1000,y_0,w_4000,h_4000/fill/w_121,h_121,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Aron%20Visuals.jpg'
            width={100}
            height={100}
            />
            <h1>One-Time Session </h1>
            <h1 className='font-bold mb-4'>$39*</h1>
            <p>Need help with a single assignment or topic?</p>
            <ul className='list-disc text-sm flex flex-col  items-start justify-center gap-2 mt-6'>
              <li>1 hour session</li>
             
              </ul>
          </div>


        </div>
 <div className='mt-16 flex flex-col items-center justify-center'>
            <h1 className='font-bold text-3xl mb-6'>Meet Your Tutor </h1>
            <Image src ='https://static.wixstatic.com/media/0d39ac_8784d15c9bbe4b45810a733f2048f2b0~mv2.jpg/v1/fill/w_305,h_270,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/0d39ac_8784d15c9bbe4b45810a733f2048f2b0~mv2.jpg' 
            width={300}
            height={300} alt = 'img' />
            <h2 className='text-xl'>Chandan Mehta</h2>
            <label>Founder & Physics / Math Tutor</label>
            <p className='w-full p-12 break-words overflow-hidden text-sm'>Chandan  is a passionate and patient tutor with over 8 years of tutoring experience helping students excel in math and science/physics. He holds master’s in physics (Minor: Math) and master’s in technology (Mechanical Engineering). Chandan has worked with middle school, high school, and college-level students both in classrooms and one-on-one settings. He specializes in conceptual explanations with real-world examples, problem-solving strategies for common exam questions and step-by-step breakdowns of complex problems. Whether it's algebra, physics, calculus or mechanics he makes learning engaging and stress-free.

With over combined 10 years of tutoring and technical experience and a background in theoretical physics and math, Chandan combines academic depth with a patient, encouraging teaching style that builds both skills and enthusiasm for the subject.

 

As his true love lies in teaching, not selling, he decided to start “The EduCorner Tutoring” where he personally trains the tutors to use his methods and way of working. The promising results has shown that he has made a foundation for students to be successful.</p>
            
          </div>




          <div className='flex w-3/4 flex-col items-center justify-center mt-12'>
            <h1 className='text-xl font-bold mb-12'>Frequently Asked Questions ?</h1>
            <ul className="list-decimal pl-6 flex flex-col w-full  space-y-4 text-gray-800">
  <li>
    <strong>What subjects do you offer tutoring in?</strong><br />
    We offer tutoring in a wide range of subjects including Math and Science (Physics, Chemistry, Biology) and more. We also provide test prep for IELTS and other exams.
  </li>
  <li>
    <strong>Who are your tutors?</strong><br />
    Our tutors are experienced professionals with strong academic backgrounds and a passion for education. Many have degrees in their subject area and years of one-on-one tutoring experience.
  </li>
  <li>
    <strong>How do tutoring sessions work?</strong><br />
    Tutoring sessions can be held online or in person, depending on your preference. Each session is customized to meet the student’s individual needs, focusing on their specific goals and learning style.
  </li>
  <li>
    <strong>What grades or age groups do you work with?</strong><br />
    We work with students from elementary school to college level.
  </li>
  <li>
    <strong>How do I schedule a session?</strong><br />
    You can book a session by phone or via email. Once you’re matched with a tutor, you’ll be able to coordinate directly for ongoing sessions.
  </li>
  <li>
    <strong>How much do tutoring sessions cost?</strong><br />
    Rates vary depending on the plans chosen. Please visit our Pricing page or contact us for detailed information.
  </li>
  <li>
    <strong>Do you offer group tutoring or just one-on-one?</strong><br />
    We primarily offer one-on-one tutoring but can arrange small group sessions upon request, especially for test prep or study groups.
  </li>
  <li>
    <strong>What if we need to cancel or reschedule a session?</strong><br />
    We understand things come up. Please give at least 24 hours’ notice for cancellations or rescheduling to avoid being charged for the session.
  </li>
</ul>

          </div>


          <label className='text-xl font-bold mt-24 '>Have more questions? Please feel free to reach us .</label>
          <button className='mt-6'>Call us </button>
          <label className='font-bold'>+1 437 226 0838</label>

          <button className='mt-12'>Email us </button>
          <label className='font-bold text-rose-600'>theeducornertutoring@gmail.com</label>
      </div>
    );
}
export default page 