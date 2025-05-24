'use client'
import {useState,useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {signIn,getSession} from 'next-auth/react'
import { CiLogin } from "react-icons/ci";

const Signin = () =>{
  const Router = useRouter()
  const [Mode,ChangeMode] = useState("◎ Show ")
  const [Type,ChangeType] = useState("password")
  const [Active,ChangeActive] = useState("active:translate-y-2 active:bg-black active:text-white")
  const [InnerText,ChangeInnerText] = useState("Login")
  const [View,ChangeView] = useState(true)
  const Session = getSession()
 // Function To Check User is Login or not 
 const Precheck = async()=>{
  const data = await Session 
  if (data != undefined){
    Router.push('/home')
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
    Router.push('/home')
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
  // Function to Show Password 
  const ShowPassword = () =>{
    const currentMode = Mode 
    const currentType = Type 
    if (currentMode == "◎ Show " && currentType == "password"){
      ChangeMode('◉ Hide ')
      ChangeType("text")
      return 0
    }
    if (currentMode == "◉ Hide " && currentType == "text"){
      ChangeMode('◎ Show ')
      ChangeType("password")
      return 0
    }

  }
  return (
      <div className = 'flex relative flex-col items-center'>
        <title>SkillsHub📝</title>
        <button onClick = {CreateAccount} className = 'absolute top-2 right-3 text-xl border-0 p-3 hover:bg-black hover:rounded-lg hover:text-white  active:bg-black active:border-black active:rounded-lg active:text-white transition duration-200 active:translate-y-2'>Create Account 🆕</button>
        <label className='mt-32 text-6xl'>🎓</label>
        <h1 className = 'text-3xl mb-12  '>Educorner Tutoring</h1>
       
        <input id ="Email" className = 'w-64 h-12 p-3 outline-none border-0 border-b-2 border-b-black text-xl' type = "text" placeholder = "Enter The Email : " />
        <input id = "Password" className = 'w-64 p-3 mt-6 outline-none mb-6 h-12 border-0 border-b-2 border-b-black text-xl'  type = {Type} placeholder = "Enter The Password" />
        <button id = "ShowBtn" onClick = {ShowPassword}>{Mode}Password</button>
        <button id = "ForgetBtn" onClick={ForgetPassword} className = 'mt-6 text-rose-600'>Forget Password 🔎</button>
       
        {View && (
          <>
                  <button id = "LoginBtn" onClick = {Login} className = {`border flex mb-6 shadow-black rounded flex gap-2 items-center justify-center  shadow-md transition duration-200  border-black px-3 py-2 bg-black text-white  text-xl mt-6 ${Active}`}>{InnerText} <CiLogin size={30} /></button>
                  <p>OR</p>
                  <button id = "GoogleBtn" onClick = {SignwithGoogle} className = 'mt-6  flex border shadow-black border-black p-3 bg-black text-white rounded-lg shadow-md active:bg-black active:text-white transition duration-200 active:translate-y-2'>Login With Google <img className = 'w-6' src = "google.png"/></button>
                  </>
        )}
        {!View && (
          <>
           <button onClick = {SendLink} id = 'SendLink' className = 'px-3 mt-12 rounded py-2 mb-6 bg-black text-white '>Send Link </button>
        <p>OR</p>
        <button onClick = {ForgetPassword} id = "Cancel" className = 'bg-rose-600 rounded px-3 mt-6 py-2 text-white'>Cancel</button>
     
          </>
        )}
        </div>
  )
}
export default Signin