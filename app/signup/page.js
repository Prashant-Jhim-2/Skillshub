"use client"
import {useState,useEffect} from 'react'
import { useRouter } from 'next/navigation'
const validator = require("email-validator")
import {signIn,getSession} from 'next-auth/react'


const Signup = () =>{
    const Router = useRouter()
    //Function To Change Disabled State of Create Button 
    const [isDisabled,ChangeisDisabled] = useState(false)
    const [Color,ChangeColor] = useState("")
    const[Alert,ChangeAlert] = useState("")
    const Session = getSession()
    // Function To Reset The Page 
    const Reset = () =>{
        ChangeisDisabled(false)
        ChangeAlert("")
        document.getElementById("EmailConfirmation").style.display='none'
        document.getElementById("CreateButton").innerHTML = "Create Account 📝"
        document.getElementById("CreateButton").style.color = 'white'
        document.getElementById("Email").value = ''
    }
    const CheckAuth = async()=>{
        const data = await Session 
        if (data != undefined){
          Router.push('/home')
        }
    }
    // UseEffect To Check Auth
    useEffect(()=>{
        CheckAuth()
    },[])
    // Function To Signup Google 
    const GoogleSignup = ()=>{
     const result =  signIn("google",{callbackUrl: '/home'})
    if (!result.ok){
      Router.push("/signup")
    }
    }
    const Signin = async()=>{
        ChangeisDisabled(true)
        document.getElementById("CreateButton").innerHTML = 'Sending...'
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
        document.getElementById("EmailConfirmation").style.display='flex'
        setTimeout(()=>{
            Reset()
        },2000)
        }
    }
    // Function To Go to Login Page 
    const Login = () =>{
        Router.push("/")
    }
    // Function To Create Account and Send Email 
    const CreateAndSend = async( ) =>{
        var status = await EmailValidator()
       console.log(status)
        if (status == true){
        Signin()
    }
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
        if (Status == true && Check == true){
            ChangeAlert("Email is Valid ✅")
            ChangeColor("text-green-600")
            return true
            
        }
        if (Status == false || Check == false){
            if (value == ""){
                ChangeAlert("")
                return false
            }
            ChangeAlert("Email is Not Valid ❌")
            ChangeColor("text-red-600")
            return false
        }
        
    }
    return (
        <div className = "flex flex-col relative items-center">
            <title>TryMyBoard📝</title>
            <button onClick = {Login} className = 'text-2xl absolute border-2 border-transparent right-6 top-2  p-3 rounded-lg hover:border-black hover:text-white active:translate-y-1 hover:bg-black active:bg-black active:text-white active:border-black transition duration-200'>Login👨🏻‍💻</button>
           <h1 className = "text-5xl mt-32">TryMyBoard📝</h1>
           <p id = "EmailConfirmation" className = 'mt-10 border hidden border-black bg-green-300 p-2 rounded-lg text-xl'>Please Check Email for Verification 📩</p>
          
           <input onChange={EmailValidator} id = "Email" className = {`w-64 mt-28 border-0 border-b-2 text-lg outline-none border-b-black h-12 ${Color}`} type = "email" placeholder = "Enter The Email :" />
            <p className = 'mt-6 '>{Alert}</p>
          
            <button onClick = {CreateAndSend} id = "CreateButton" disabled={isDisabled}   className = "bg-black h-12 text-white px-3 py-2 rounded-lg mt-12">Create Account 🆕</button>
            <h3 className = 'mt-6 mb-3'>OR</h3>
            <button onClick={GoogleSignup} disabled = {isDisabled} className = 'flex rounded-lg shadow-md bg-black text-white   active:bg-black active:shadow-gray-500 active:text-white active:translate-y-1 transition duration-200 px-6 py-3 border border-black p-3'>Signup With Google <img className = 'w-6' src = "google.png"/></button>
         
        </div>
    )
}
export default Signup