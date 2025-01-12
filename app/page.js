'use client'
import {useState,useEffect} from 'react'
import {useRouter} from 'next/navigation'
import {signIn,getSession} from 'next-auth/react'

const Signin = () =>{
  const Router = useRouter()
  const [Mode,ChangeMode] = useState("◎ Show ")
  const [Type,ChangeType] = useState("password")
  const [Active,ChangeActive] = useState("active:translate-y-2 active:bg-black active:text-white")
  const [InnerText,ChangeInnerText] = useState("Login")
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
  const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Email`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({Email:'pkjhim2001@gmail.com'})
  })
  const Result = await Request.json()
  console.log(Result)
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
        <h1 className = 'text-5xl mt-32 mb-12'>SkillsHub📝</h1>
        <input id ="Email" className = 'w-64 h-12 p-3 outline-none border-0 border-b-2 border-b-black text-xl' type = "text" placeholder = "Enter The Email : " />
        <input id = "Password" className = 'w-64 p-3 mt-6 outline-none mb-6 h-12 border-0 border-b-2 border-b-black text-xl'  type = {Type} placeholder = "Enter The Password" />
        <button onClick = {ShowPassword}>{Mode}Password</button>
        <button onClick={ForgetPassword} className = 'mt-6 text-rose-600'>Forget Password 🔎</button>
        <button onClick = {Login} className = {`border mb-6 shadow-black rounded  shadow-md transition duration-200  border-black p-3 bg-black text-white  text-xl mt-6 ${Active}`}>{InnerText}</button>
        <p>OR</p>
        <button onClick = {SignwithGoogle} className = 'mt-6 flex border shadow-black border-black p-3 rounded-lg shadow-md active:bg-black active:text-white transition duration-200 active:translate-y-2'>Login With Google <img className = 'w-6' src = "google.png"/></button>
      </div>
  )
}
export default Signin