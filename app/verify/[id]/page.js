'use client'
import {useState,useEffect} from 'react'
import { useParams, useRouter } from 'next/navigation'
import { passwordStrength } from 'check-password-strength'
import {signIn} from 'next-auth/react'
const bcryptjs = require("bcryptjs")

export async function getdata(id){
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Verify`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({id})
    })
    const Response = await Request.json()
    return Response
  }

const page = () =>{
    const router = useRouter()
    const params = useParams()
    const [Strength,ChangeStrength] = useState("")
    const [Comparsion ,ChangeCompare] = useState("")
    const [Email,ChangeEmail] = useState(null)
    const [Alert,ChangeAlert] = useState("")
    // Component to disable button when click first
    const [State,ChangeState] = useState("active:bg-black active:text-white active:translate-y-2")

    //Function To Get Back To Login Page
    const Back = () =>{
        router.push('/')
    }
    // Function For Calling To Avoid UseEffect Cleanup problem
    const FastFunc = async()=>{
        const Verification = await getdata(params.id)
       if (Verification.status == true){
        ChangeEmail(Verification.Email)
       }
       else{
        alert("This Link Has Been Expired ❌")
        router.push("/")
       }
    }
    useEffect(()=>{
        FastFunc()
    },[])
    // Function To Finsh Signup  
    const FinshSignup = async () =>{
        const Matched = Match()
        const Strngth = PassCheck()
        const hashed = await bcryptjs.hash(document.getElementById("Password").value ,10)
        console.log(Matched,Strngth)
        if (Matched == true && Strngth == true){
            document.getElementById("Alert").style.display = 'none'
            const Details = {
                Email:Email ,
                FullName: document.getElementById("FullName").value,
                Password: hashed
            }
            console.log(Details)
            ChangeState("bg-black text-white animate-jump")
            document.getElementById("FinshSignup").innerHTML = "Redirecting.."

            // Sent Details To Database To Complete Registration 
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Register`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(Details)
            })
            const Response = await Request.json()
            if (Response.status == true){
                console.log(Response)
                const Result = await signIn("credentials",{
                    redirect:false,
                    Email:Email ,
                    Password:document.getElementById("Password").value
                  })
                  if (Result?.error){
                    alert("Invalid Email and Password")
                  }
                  else{
                    router.push('/home')
                  }
            }
        }

        

        if (Matched == false && Strngth == false){
            console.log("i am working")
            document.getElementById("Alert").style.display = 'flex'
            ChangeAlert("Both Password Strength and Passwords Mismatched")
        }
        if (Matched == true && Strngth == false){
            console.log("i am working")
            document.getElementById("Alert").style.display = 'flex'
            ChangeAlert("Password is Weak")
        }
        if (Matched == false && Strngth == true){
            console.log("i am working")
            document.getElementById("Alert").style.display = 'flex'
            ChangeAlert("Password Mismatched")
        }

    }
    //Function To Compare Both Password is it Same or not 
    const Match = () =>{
        const value1 = document.getElementById("Password").value 
        const value2 = document.getElementById("ConfirmPassword").value 
        console.log(value1 == value2)
        if (value1 != '' && value2 != ''){
            if (value1 == value2){
                ChangeCompare("True")
                document.getElementById("Compare").style.color = 'green'
                return true
            }
            if (value1 != value2){
                ChangeCompare("False")
                document.getElementById("Compare").style.color = 'red'
                return false
            }
        }
        else{
            return false
        }
    }
    //Function To Check Password Strength 
    const PassCheck = () =>{
        const value = document.getElementById("Password").value
        if (value != ''){
            document.getElementById("Requirement").style.display = 'flex'
            const status = passwordStrength(value).value 
            ChangeStrength(status)
            if (status == 'Too weak' || status == 'Weak'){
                document.getElementById("PassStrength").style.color = 'red'
                return false
            }
            
            if (status == 'Medium'){
                document.getElementById("PassStrength").style.color = 'orange'
                return false
            }
            if (status == 'Strong'){
                document.getElementById("PassStrength").style.color = 'green'
                return true
            }
        }
        if (value == ''){
            document.getElementById("Requirement").style.display = 'none'
            return false 
        }
    }
return (
    <div className = 'flex relative flex-col items-center'>
        <button onClick={Back} className = "border border-black p-3 text-xl absolute top-2 left-3 rounded transition duration-200 active:translate-y-2 shadow-lg active:bg-black active:text-white">Back</button>
        <h1 className = 'text-5xl mt-32'>SkillsHub📝</h1>
        <p id = "Alert" className = 'animate-jump hidden  shadow-lg mt-6 p-3 border border-black transition duration-200 translate-y-2 rounded-lg bg-red-300'>Alert:{Alert}</p>
        <input id = "FullName" className = 'mt-12 text-xl mb-3 border-0 outline-none border-b-2 border-black w-64 h-12 p-2' type = "text" placeholder = "Enter The FullName" />
        <input onChange={PassCheck} id = "Password" className = ' mb-3 text-xl mb-3 border-0 outline-none border-b-2 border-black w-64 h-12 p-2' type= 'text' placeholder = "Enter The Password" />
        <input onChange={Match} id = "ConfirmPassword" className = ' mb-3 text-xl mb-3 border-0 outline-none border-b-2 border-black w-64 h-12 p-2' type = 'text' placeholder = "Confirm The Password" />
        <ul id = "Requirement" className = 'hidden flex-col mb-6 mt-6'>
            <li>Password Strength : <strong id = "PassStrength">{Strength}</strong></li>
            <li>Password Matched : <strong id = "Compare">{Comparsion}</strong></li>
        </ul>
        <button id = "FinshSignup" onClick= {FinshSignup} className = {`border p-3 mt-6 rounded-lg shadow-xl duration-200 transition  ${State} border-black`} >Finish Signup</button>
    </div>
)
}
export default page