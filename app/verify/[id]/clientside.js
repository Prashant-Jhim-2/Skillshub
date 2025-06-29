'use client'
import {useState} from 'react'
import { useRouter } from "next/navigation"
import { passwordStrength } from 'check-password-strength'
const bcryptjs = require("bcryptjs")
import {signIn} from 'next-auth/react'

const Page = ({data}) =>{
    const Router = useRouter()
    console.log(data)
    if (data.Type == "Change"){
        const CompleteChange = async() =>{
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/UpdateDetails`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({Email:data.Email,Details:data.Details})
            })
            const Response = await Request.json()
            if (Response.status == true){
                document.getElementById("alert").style.display = 'flex'
                Router.push("/home")
            }
        }

        const Cancel = () =>{
            Router.push("/")
        }
        return (
            <div className = 'flex flex-col items-center justify-center'>
                <h1 className = 'text-2xl mt-6'>TryMyBoard📝</h1>
                <p id = "alert" className ='mt-3 hidden bg-green-600 px-3 py-2 text-white border border-black'>Details has been updated 📤</p>
                <p className ='text-xl mt-36'>Click The Button To Update Details</p>
                <button onClick = {CompleteChange} className = 'border active:bg-white active:text-black  border-black px-3 py-2 animate-jump transition duration-200 rounded-lg bg-black text-white mt-12'>Update 🔁</button>
                <label className = 'mt-6 mb-6'>OR</label>
                <button onClick = {Cancel} className ='text-rose-600'>Cancel</button>

            </div>
        )
    }


    if (data.Type == "Register"){
        const [Alert1,ChangeAlert1] = useState("")
        const [Alert2,ChangeAlert2] = useState("")
        // Function To Create Account 
        const CreateAccount = async()=>{
            const FullName = document.getElementById("FullName").value
            const Password = document.getElementById("Password").value 
            const MatchCheck = MatchPassword()
            const PassStr = StrengthPassword()
            
            const hashed = await bcryptjs.hash(Password ,10)
            const Details = {
                Email:data.Email,
                FullName: FullName ,
                Password:hashed
            }
            console.log(Details)
            console.log(FullName != '' && MatchCheck && PassStr)
            if (FullName != '' && MatchCheck && PassStr){
                const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Register`,{
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body:JSON.stringify(Details)
                })
                const Response = await Request.json()
                if (Response.status == true){
                    const Result = await signIn("credentials",{
                        redirect:false,
                        Email:data.Email ,
                        Password:document.getElementById("Password").value
                      })
                      if (Result?.error){
                        alert("Invalid Email and Password")
                      }
                      else{
                        Router.push('/home')
                      }
                }
            }
        }
        // Function To Check Strength of Password 
        const StrengthPassword = ()=>{
            const val1 = document.getElementById("Password").value 
            if (val1 != ''){
                const strength = passwordStrength(val1).value
                ChangeAlert1(strength)
            if (strength == "Too weak" || strength == 'weak' || strength == "Medium"){
                document.getElementById("Password").style.outlineColor = "red"
                return false
            }
            if (strength == "Strong"){
                document.getElementById("Password").style.outlineColor = "green"
                return true
            }
            }
            if (val1 == ''){
                return false
            }
        }
        // Function To Match Both Password 
        const MatchPassword = () =>{
            const val1 = document.getElementById("Password").value 
            const val2 = document.getElementById("ConfirmPassword").value
            if (val1 == val2){
                ChangeAlert2("Matched✅")
                document.getElementById("ConfirmPassword").style.outlineColor = "green"
                return true
            } 
            else{
                document.getElementById("ConfirmPassword").style.outlineColor = "red"
                ChangeAlert2('Mismatched❌')
                return false
            }

        }
        return (
            <div className = 'flex items-center justify-center flex-col'>
                <button className = 'fixed top-2 left-2'>Back To Login</button>
                <h1 className = 'text-3xl mt-12'>TryMyBoard📝</h1>
                <div className = 'flex relative gap-3 mt-12 flex-col '>
                <label>FullName</label>
                <input id = "FullName"  className = 'w-80 border-b text-xl outline-black px-2 border-black h-12' type = 'text' placeholder= "Enter The FullName" />
                <label>Password</label>
                <input onChange = {StrengthPassword} id = "Password" className = 'w-8- border-b text-xl outline-black px-2  border-black h-12' type = 'text' placeholder = 'Enter The Password'/>
                <label className = 'flex items-center'>Confirm Password </label>
                <input onChange= {MatchPassword} id = "ConfirmPassword" className = 'w-8- border-b text-xl outline-black px-2  border-black h-12' type='text' placeholder = "Confirm The Password" />
                <label className = 'text-xs'>Password Strength :{Alert1}</label>
                <label className = 'text-xs'>Password Match : {Alert2}</label>
                <button onClick={CreateAccount} className = ' border animate-jump transistion duration-200 mt-6 active:bg-white active:text-black  border-black px-3 py-2 rounded bg-green-500 text-white'>Create Account 🆕</button>
                 
                </div>
            </div>
        )
    }
}
export default Page 