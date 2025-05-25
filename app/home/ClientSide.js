'use client'
import {useState} from 'react'
import { getSession ,signOut} from 'next-auth/react';
import Head from 'next/head'
import { LuMessagesSquare } from "react-icons/lu";
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
    const [Enrolled,ChangeEnrolled] = useState([])
    const [QueryinCard,ChangeQueryinCard] = useState('')
    const [isOpen, setIsOpen] = useState(false);
    const [Empty,ChangeEmpty] = useState(false) 
    const [Details,ChangeDetails] = useState({FullName:"",ImgSrc:"https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/photos%2F3d-cartoon-character.jpg?alt=media&token=90e0d748-1074-4944-8302-32644c60407c"})
    const session = getSession();
    const [Cards,ChangeCards] = useState([])
    const [MenuBtn,ChangeMenuBtn] = useState(<>Menu <TiThMenuOutline  size={30}/></>)
    

    
     
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
        if (data == undefined){
          Router.push('/')
        }
        if (data != undefined){
            
            const dataofcards = carddata
            GetEnrolled(data.user.id)
            console.log(dataofcards)
            document.getElementById("Courses").style.backgroundColor = 'black'
            document.getElementById("Courses").style.color = 'white'
            document.getElementById("Enrolled").style.backgroundColor = 'white'
            document.getElementById("Enrolled").style.color = 'black'
           ChangeCards(dataofcards)
          

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
           if (Response.status == false){
            Router.push('/')
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
        await signOut({callbackUrl:"/"})
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
    return (
      <div className="flex relative flex-col items-center">
        <title>Educorner Tutoring📝</title>
        <div className={`${AlertDisplay} items-center justify-center top-0 z-10 left-0 animate-moveDownFade text-white h-12 bg-red-500 w-full `}>
          <nav><Link href='/alerts'><button className='flex gap-2 items-center justify-center'>New Messages <BiMessage  size = {15}/></button></Link></nav>
        </div>
        <div id = "AlertNotify" className="fixed z-20 shadow-sm bg-white p-4 flex w-full">
          <h1 className="text-xl font-bold">Educorner 📖</h1>
          <button onClick={OpenOrClose} className="fixed flex gap-3 z-12 top-2 p-3 text-lg right-2">{MenuBtn}</button>
        </div>

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

        <h2 className="mt-36 hidden text-3xl">
          Hi <strong>{Details.FullName} 👋🏻</strong>
        </h2>
      <label className='mt-36 text-6xl'>📖</label>
       <h1 className = 'font-bold    text-center text-3xl mb-12'>Welcome to <label className='text-orange-600'>Educorner </label><label className='text-blue-600'>Tutoring📝</label></h1>
      
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

       <div className=' w-full flex flex-col pb-12 pt-12  items-center justify-center mt-12'>
        <h1 className='font-bold text-4xl'>Why Choose Us ?</h1>
        <ul className='flex list-disc w-80 text-md flex-col gap-3 mt-6'>
         <li><strong>Expert Tutors:</strong> Carefully vetted professionals passionate about teaching</li>

<li><strong>Flexible Scheduling:</strong>  Learn at your pace, on your time</li>

<li><strong>Customized Learning: </strong> Personalized support that fits your unique learning style</li>

<li ><strong>Safe & Secure:</strong> A trusted platform for students and parents alike</li>
        </ul>


        <h1 className='font-bold mt-24 text-4xl'>Subjects</h1>
       </div>
        <div className=" mb-6 flex gap-3 text-xl">
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

        {Cards.length > 0 && Enrolled.length >= 0 && Details?.id && 
        <div className='flex flex-wrap gap-6 justify-center'>
          {Cards.map((data) => {
            if (data != undefined){
              const condition = Enrolled.includes(data.id);
               console.log(Enrolled , data.id )
              const verify = Details.id == data.ProfessorId
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
      </div>
    );
}
export default page 