'use client'
import {useState,useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {signIn,getSession} from 'next-auth/react'
import { RiLoginBoxLine } from "react-icons/ri";
import { FcGoogle } from 'react-icons/fc'
import {motion} from 'framer-motion'  
import { MdFiberNew } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
const Signin = () =>{
  const Router = useRouter()
  const [Mode,ChangeMode] = useState("◎ Show ")
  const [Type,ChangeType] = useState("password")
  const [LoginorSignup,ChangeLoginorSignup] = useState("Login")
  const [Alert,ChangeAlert] = useState(false)
  const [AlertMessage,ChangeAlertMessage] = useState("")
  const [View,ChangeView] = useState(true)
  const Session = getSession()
 // Function To Check User is Login or not 
 const Precheck = async()=>{
  const data = await Session 
  if (data != undefined){
    Router.push('/home')
  }
 }

 const ChangeToLoginorSignup = (event)=>{
  const id = event.target.id
  if (id == "Login"){
    ChangeLoginorSignup("Login")
  }
  if (id == "Signup"){
    ChangeLoginorSignup("Signup")
  }
 }
 // UseEffect
 useEffect(()=>{
  Precheck()
 },[])
 // Google Function 
 const SignwithGoogle = async()=>{
      const result =  signIn("google",{callbackUrl: '/home'})
      if (!result.ok){
        Router.push("/")
      }
 }
 // Function To Fetch Data 
 const Login = async() =>{
  const Result = await signIn("credentials",{
    redirect:false,
    Email:document.getElementById("Email").value ,
    Password:document.getElementById("Password").value
  })
  if (Result?.error){
    alert("Invalid Email and Password")
  }
  else{
    ChangeAlert(true)
    ChangeAlertMessage("Login Successfully ✅")
    setTimeout(() => {
      Router.push('/home')
    }, 2000);
   
  }
  
}


// Function To Forget Password 
const ForgetPassword = async() =>{
  const prev = View 
  if (prev == true){
    ChangeView(false)
    document.getElementById("Password").style.display = 'none'
    document.getElementById("ShowBtn").style.display = 'none'
    document.getElementById("ForgetBtn").style.display = 'none'
    return 0
  }
  else {
    ChangeView(true)
    document.getElementById("Password").style.display = 'flex'
    document.getElementById("ShowBtn").style.display = 'flex'
    document.getElementById("ForgetBtn").style.display = 'flex'
    return 0
  }
}

// Function To Send Link To Email for Forget Password
  const SendLink = async() =>{
    document.getElementById("SendLink").disabled = true
    document.getElementById("SendLink").innerHTML = "Sending...."
    const Value = document.getElementById("Email").value
    const domain = window.location.origin 
    if (Value != ''){
      const Request = await fetch(`/api/email`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:Value,domain,type:"forget"})
      })
      const Response = await Request.json()
      console.log(Response)
      if (Response.status == true){
        document.getElementById("SendLink").disabled = false
        document.getElementById("SendLink").innerHTML = 'Send Link '
        document.getElementById("Email").value=''
      }
      else {
        document.getElementById("SendLink").disabled = false
        document.getElementById("SendLink").innerHTML = 'Send Link '
        document.getElementById("Email").value=''
        alert("Something Went Wrong ❌")
      }
    }
  }
  //Function To Go to Signup Page 
  const CreateAccount = ()=>{
    Router.push("/signup")
  }
  
  return (
      <div className = 'flex relative h-screen w-screen flex-col justify-center items-center'>
        <title>SkillsHub📝</title>

       {Alert && <motion.h1
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-2 z-10 border bg-white border-black rounded text-black font-bold   text-black  text-sm h-12   flex items-center justify-center  w-64"
      >
        {AlertMessage}
      </motion.h1>}

            <div
        className="absolute inset-0 bg-cover bg-center  scale-110"
        style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/Bgimage%2F16332411_rm347-porpla-02-a-01.jpg?alt=media&token=f1c411b1-8b64-4b5d-a45c-cc34d21f0973')" }}
      />

  
            

  {/* Content */}
  
        <div className='w-80 p-6 bg-white relative rounded-lg flex flex-col shadow-xl items-center justify-center border '>
         
          {LoginorSignup == "Login" && <>
           <button onClick={ChangeToLoginorSignup} id = "Signup" className='text-xs p-3 flex gap-2 top-2 items-center justify-center active:border active:shadow-lg active:text-black    text-rose-600 font-bold  rounded-lg absolute top-0 right-2'>Create Account <CgProfile size={20} /> </button>
          </>}
          {LoginorSignup == "Signup" && <>
           <button onClick={ChangeToLoginorSignup} id ="Login" className='text-xs p-3 flex gap-2 top-2 items-center justify-center active:border active:shadow-lg active:text-black    text-rose-600 font-bold  rounded-lg absolute top-0 right-2'> Login <CgProfile size={20} /> </button>
          </>}


            <h1 className='text-lg mt-12 font-bold'>Educorner 📝</h1>
          <label className='text-xs mb-6'>Tutoring</label>
         
          <input id = "Email" className='w-64 text-sm border-2 rounded border-black h-12 p-2  outline-black' type = 'text' placeholder='Enter The Email : ' />
          {LoginorSignup == "Login" && <>
           <input id = "Password" className='w-64 mt-3 text-sm border-2 rounded border-black h-12 p-2  outline-black' type = 'text' placeholder='Enter The Password : ' />
          <button className='text-rose-600 text-sm mt-6'>Forget Password</button>
          </>}
          
    {LoginorSignup == "Login" && <>
       <motion.button
      id = "LoginBtn"
      onClick={Login}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-3 mt-6 bg-black mb-3 flex gap-2 items-center justify-center text-white  font-semibold rounded-lg shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-black"
     
    >
     Login <RiLoginBoxLine size={15} />
    </motion.button>
      </>}


     {LoginorSignup == "Signup" && <>
     <motion.button
      
      onClick={Login}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-3 mt-6 bg-rose-600 mb-3 flex gap-2 items-center justify-center text-white  font-semibold rounded-lg shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-black"
     
    >
     Create Account <MdFiberNew size={15} />
    </motion.button>
     </>}

     <label>OR</label>
     {LoginorSignup == "Login" && <>
     <motion.button
           onClick={SignwithGoogle}
           whileHover={{ scale: 1.03 }}
           whileTap={{ scale: 0.97 }}
           transition={{ type: 'spring', stiffness: 300 }}
           className="flex items-center mt-3 justify-center gap-3 w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-black font-medium hover:bg-gray-50"
       
         >
           <FcGoogle size={22} />
           Login with Google
         </motion.button>
     </>}

           {LoginorSignup == "Signup" && <>
           <motion.button
      onClick={SignwithGoogle}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="flex items-center mt-3 justify-center gap-3 w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm text-black font-medium hover:bg-gray-50"
  
    >
      <FcGoogle size={22} />
      Signup with Google
    </motion.button>
           </>}
        </div>

        
</div>
  
  
  )
}
export default Signin