'use client' 

import { useEffect,useState,useRef } from "react";
import { LuClock5 } from "react-icons/lu";
import { IoArrowBack } from "react-icons/io5";
import { GrLinkNext } from "react-icons/gr";
import Image from "next/image";
import { LuFileUp } from "react-icons/lu";
import { MdOutlinePreview } from "react-icons/md";
import { LuCheck } from "react-icons/lu";
import { LuInfo } from "react-icons/lu";
import { useParams } from "next/navigation";
import { getSession } from "next-auth/react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { createClient } from "@supabase/supabase-js";
// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  // Function to upload file to Supabase Storage
  const UploadToSupabase = async (file,quizid,studentid) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `newpdfs/${fileName}-/${studentid}/${quizid}`
  
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('newpdfs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
  
      if (error) throw error
  
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('newpdfs')
        .getPublicUrl(filePath)

        
  
      return {
        status: true,
        Url: publicUrl
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        status: false,
        error: 'Failed to upload file'
      }
    }
  }
  
  



pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Clientside = ({data})=>{
    const session = getSession()
    const params = useParams()
    const [UserDetails,SetUserDetails] = useState({id:undefined,Name:undefined,Email:undefined})
   
    const [isAcknowledged,setIsAcknowledged] = useState(false)
  
    const [Question,setQuestion] = useState(data.Questions)
    const [CurrentQuestion,setCurrentQuestion] = useState(0) 
   const [Answer,ChangeAnswer] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    
   

    const checkauth = async()=>{
        const Session = await session 
        console.log(Session)
        if (Session.user != undefined){
            const user = Session.user 
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${user.id}`)
            const Response = await Request.json() 
            console.log(Response)
            if (Response.status == true){
                return Response.Details
            }
            else{
                return null
            }
        }
        else{
            return null 
        }
    }
    // Function to upload the file to the superbase 

    // Function to Submit the Quiz 

    const SubmitQuiz = async()=>{ 
        console.log("Submit Quiz")
        const Quizid = params.id 
        console.log(Quizid)
        const Studentid = UserDetails.id 
        console.log(Studentid)
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/FetchStudentAnswers/${Quizid}/${Studentid}`)
        console.log(Request)
        const Response = await Request.json() 
        console.log(Response)
       
        }
        

    // Function for Counting the Time to prevent the page from refreshing\
    const CountingTime = ()=>{
        const [Minutes,setMinutes] = useState(parseInt(data.TimeLimit) -1)
        const [timeinSeconds,setTimeinSeconds] = useState(60)
       

       useEffect(()=>{
        const timer = setInterval(()=>{
            setTimeinSeconds(prevSeconds => {
                if (prevSeconds > 0) {
                    return prevSeconds - 1;
                } else {
                    setMinutes(prevMinutes => {
                        if (prevMinutes > 0) {
                            return prevMinutes - 1;
                        } else {
                            // Time's up - auto submit quiz
                            clearInterval(timer);
                            return 0;
                        }
                    });
                    return 60;
                }
            });
        },1000)
        
        return ()=>{
            clearInterval(timer);}
       },[])

       return (
       
        <div className="flex fixed bg-white border text-md top-2 right-2 p-2  rounded-lg  gap-2 items-center justify-center ">
        
             Time Left :
             <LuClock5 size={20} />
             <h1 className="font-bold  text-green-600">{Minutes}:{timeinSeconds < 10 ? '0' + timeinSeconds : timeinSeconds} Minutes </h1>
             
             
        </div>)
       
    }


    
   

    // Question Div 
    const QuestionDiv = (props)=>{
        const [saving,savingornot] = useState(false)
        const [filetext,setfiletext] = useState('')
        const [fileurl,setfileurl] = useState(undefined)
        const [filename,setfilename] = useState(null)
        const [Processing,setProcessing] = useState(false)
        const Question = props.data 



        const hearfilechange = async(e)=>{
            const file = e.target.files[0]
            
            // File validation
            if (!file) {
                alert("Please select a file")
                return
            }
            
            // Check file type
            if (file.type !== 'application/pdf') {
                alert("Please select a PDF file")
                return
            }
            
            // Set filename
            setfilename(file.name)
            
            // Show loading state
            setProcessing(true)
            
            try {
                const reader = new FileReader() 
                reader.onload = async()=>{
                    try {
                        const typedarray = new Uint8Array(reader.result) 
                        const pdf = await pdfjsLib.getDocument({data:typedarray}).promise  
                        let fulltext = '' 
                        
                        for (let i = 1 ; i <= pdf.numPages ; i++){
                            const page = await pdf.getPage(i) 
                            const content = await page.getTextContent() 
                            fulltext += content.items.map(item=>item.str).join(' ')
                        }
                        setfiletext(fulltext)
                        console.log(fulltext)
                        setTimeout(()=>{
                            setProcessing(false)
                        },2000)
                        setTimeout(async () => {
                            handleSave(fulltext)
                            
                            // Upload file and handle result
                            const uploadResult = await UploadToSupabase(file, params.id, UserDetails.id)
                            
                            if (uploadResult.status == true) {
                                console.log('File uploaded successfully:', uploadResult.Url)
                                // Set the file URL for viewing
                                setfileurl(uploadResult.Url)
                                // You can save the URL to your database here
                                // For example, save both text and file URL
                                const answerData = {
                                    text: fulltext,
                                    fileUrl: uploadResult.Url,
                                    fileName: filename
                                }
                                console.log('Answer data:', answerData)
                            } else {
                                console.error('Upload failed:', uploadResult.error)
                                alert('File upload failed: ' + uploadResult.error)
                            }
                            
                            savingornot(true)
                        }, 2000)
                        
                    } catch (pdfError) {
                        console.error("Error processing PDF:", pdfError)
                        alert("Error processing PDF file. Please try again.")
                        setProcessing(false)
                    }
                }
                
                reader.onerror = () => {
                    alert("Error reading file")
                    setProcessing(false)
                }
                
                reader.readAsArrayBuffer(file)
                
            } catch (error) {
                console.error("Error in file processing:", error)
                alert("Error processing file")
                setProcessing(false)
            }
        }

        const handleSave = async(value) => {
            if (value.trim() === '') {
                alert("No text extracted from PDF. Please try again.")
                return
            }
            await hearchange(value)
        }

        const handleClear = () => {
            setfilename('')
            setfiletext('')
            setfileurl('')
            setProcessing(false)
            hearchange('')
            // Reset the file input
            const fileInput = document.getElementById(`file-input-${props.index}`)
            if (fileInput) {
                fileInput.value = ''
            }
        }

        const hearchange = async(value) =>{
            savingornot(true)
            console.log({
                TotalMarks:data.Marks,
                Quiz:params.id,
                Student:UserDetails.id,
                details:{index:props.index,...props.data,Answer:value},
                Answer :value
            })
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/SaveQuiz`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    TotalMarks:data.Marks,
                    Quiz:params.id,
                    Student:UserDetails.id,
                    details:{index:props.index,...props.data,Answer:value},
                    Answer :value
                })
            })
            const Response = await Request.json()
            if (Response.status == true){
                setTimeout(()=>{
                    savingornot(false)
                },3000)
            }
            else{
                alert("Error in Saving")
            }
        }
        return (
          <div className = 'bg-white relative w-[90%] sm:w-full xs:w-full md:w-3/4 lg:w-3/4 xl:w-3/4 2xl:w-3/4 shadow-2xl rounded-lg py-12  px-4'>
            <label className="text-sm self-start mt-4 mb-6"> Question {props.index + 1} </label>
            {saving && <><div className="absolute top-2 border-2 shadow-lg  right-4 flex items-center gap-2  px-3 py-2 ">
                <div className="w-6 h-6 rounded-full duration-300  border-b-green-500 border-b-2 animate-spin"></div>
                <span className="text-sm animate-pulse font-medium">Saving...</span>
            </div></>}
            <h1 className="text-lg self-start mt-4 mb-6 break-words overflow-wrap-anywhere leading-relaxed"> {Question.Question}  </h1>   
            {Question.QuestionType == "Text"&&<>
            <textarea
                onChange = {(e)=>{
                    hearchange(e.target.value)
                }}
                placeholder="Enter your answer here" 
                className="w-full text-base h-64 p-2 border-2 outline-black border-black rounded-lg" 
             
            />
            </>}
            {Question.QuestionType == "File Upload"&&<>
            <div className="flex flex-col gap-4 w-full">
                {!filename && <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input 
                        type="file" 
                        onChange={hearfilechange}
                        accept=".pdf"
                        className="hidden"
                        id={`file-input-${props.index}`}
                    />
                    <label 
                        htmlFor={`file-input-${props.index}`}
                        className="cursor-pointer flex flex-col items-center gap-2"
                    >
                        <LuFileUp size={40} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                            Click to upload PDF file (max 10MB)
                        </span>
                        <span className="text-xs text-gray-500">
                            Only PDF files are allowed
                        </span>
                    </label>
                </div>}
                {fileurl && (
                    <div className="flex w-full border-2 border-gray-200 rounded-lg p-4 items-center gap-2 mb-4">
                        
                        <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileurl)}&embedded=true`}
            width="100%"
            height="500px"
            title="PDF Viewer"
            allow="fullscreen"
            frameBorder="0"
          />
                    </div>
                )}
                
                {filename && (
                    <div className="bg-gray-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <LuFileUp size={20} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700">File uploaded:</label>
                                <p className="text-sm text-green-600 font-semibold truncate">{filename}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick = {handleClear}
                                className="flex gap-2 items-center active:scale-95 active:bg-red-500/90 active:text-white transition-all active:duration-100 justify-center bg-red-600/90 rounded-lg font-bold text-white p-2 "
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Clear File 
                            </button>
                        </div>
                    </div>
                )}
                             
                
                {Processing && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                        <div className="w-4 h-4 rounded-full border-b-blue-500 border-b-2 animate-spin"></div>
                        <span>Processing PDF and extracting text...</span>
                    </div>
                )}
            </div>
            </>}
            {Question.QuestionType == "MCQ"&&<>
            <div className = 'flex flex-col gap-2  self-start'>
                {Question.Options.map((data, optionIndex)=>{
                    return (
                        <div key={optionIndex} className="flex gap-2 items-center">
                            <input 
                                onClick = {()=>{
                                    hearchange(data.value)
                                }}
                                type="radio" 
                                className = 'w-6 h-6' 
                                name={`option-${props.index}`}
                                id={`option-${props.index}-${optionIndex}`}
                            />
                            <label htmlFor={`option-${props.index}-${optionIndex}`}>{data.value}</label>
                        </div>
                    )
                })}
            </div>
            </>}
          </div>

        )
    }

  
   
    const CheckAnswer = async (props)=>{
        const Answer = {
            Question : props.Question ,
            Answer :props.Answer ,
            Marks:props.Marks ,
            QuestionType:props.QuestionType,
            Options:props.Options || null ,
            ChoseOption :props.ChoseOption || null ,
            GainedMarks :0
        }
        const Request = await fetch('/api/openai',{
            method:"POST"
        })
        
        
    }

    const openFileInNewTab = (url) => {
        try {
            // Try to open in new tab
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            if (newWindow) {
                newWindow.opener = null;
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(url).then(() => {
                    alert('File URL copied to clipboard. Please paste it in a new tab.');
                }).catch(() => {
                    alert('Please copy this URL and open it in a new tab: ' + url);
                });
            }
        } catch (error) {
            console.error('Error opening file:', error);
            alert('Unable to open file. Please copy the URL and open it manually.');
        }
    }

   
        useEffect(()=>{
            const fetchUserDetails = async()=>{
                const User = await checkauth()
                console.log(User)
                if (User){
                    SetUserDetails(User)

                }
                else {
                    console.log("User not found")
                }
            }
            fetchUserDetails()

            // Apply background to body element
            document.body.style.backgroundImage = `url('https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/Bgimage%2F16332411_rm347-porpla-02-a-01.jpg?alt=media&token=f1c411b1-8b64-4b5d-a45c-cc34d21f0973')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.minHeight = '100vh';

                return ()=>{
                // Clean up body styles when component unmounts
                document.body.style.backgroundImage = '';
                document.body.style.backgroundSize = '';
                document.body.style.backgroundPosition = '';
                document.body.style.backgroundRepeat = '';
                document.body.style.backgroundAttachment = '';
                document.body.style.minHeight = '';
                }
            
        },[])

        // Test Supabase connection
        const testSupabaseConnection = async () => {
            try {
                console.log('Testing Supabase connection...')
                
                // Test basic connection
                const { data, error } = await supabase
                    .from('your_table_name') // Replace with any table
                    .select('*')
                    .limit(1)
                
                if (error) {
                    console.error('Connection failed:', error)
                    return false
                }
                
                console.log('✅ Supabase connection successful')
                return true
                
            } catch (error) {
                console.error('❌ Connection test failed:', error)
                return false
            }
        }

        // Call this in useEffect
        useEffect(() => {
            testSupabaseConnection()
        }, [])

        return(
    <div 
        
        className="w-full">
        
       <div className="flex   flex-col items-center pt-16 min-h-screen">
         {/* Header Part */}
         <h1 className="text-xl  text-blue-800 p-2 bg-white/70 rounded-lg backdrop-blur-sm shadow-xl border ">TryMyBoard  / <span className="text-orange-600">Quiz</span></h1>



{/* Quiz Name */ }
<h2 className = 'text-lg mt-6 bg-white border p-2 rounded-lg '>Quiz : {data.Name}</h2>


{!isAcknowledged&&<div 

className="w-screen h-screen z-20 fixed top-0 left-0 bg-black/50 z-10">

</div>}

{!isAcknowledged&&<div className = 'w-[90%] fixed flex flex-col  z-30 py-6 px-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white sm:w-full xs:w-full md:w-1/2 lg:w-1/2 xl:w-1/2 2xl:w-3/4 shadow-2xl rounded-lg py-6  px-4'>

<label className="text-md flex gap-2 items-center shadow-md justify-center bg-orange-500 text-white mt-6 bg-orange-500/90 backdrop-blur-sm border p-2 rounded-lg ">Important Notice <LuInfo size={20} /></label>
<p className="text-md mt-6">  <span>1 .</span>   This Quiz Saves Your Progress Automatically</p>
<p className="text-md mt-3"><span>2 .</span>   This Quiz Will Be Submitted Automatically When The Time Runs Out</p>
<p className="text-md mt-3"><span>3 .</span>   This Quiz Submitted Button Will be Enabled When You Have Answered All The Questions</p>
<p className="text-md mt-3"><span>4 .</span>   Quiz can be resumed from the same point where you left off if you refresh the page</p>

<button onClick={()=>setIsAcknowledged(true)} className="bg-white text-black active:bg-black transition-colors duration-300 active:text-white border-2 border-black  p-2 mt-12 flex gap-2 items-center rounded-lg self-center">I Acknowledge <LuCheck size={20} /></button>
</div>}
<CountingTime/>

<Image className = 'rounded-full w-16 h-16 fixed top-2 left-2 ' src = {UserDetails.ImgSrc} alt = "User Image" width={100} height={100} />


{/* No of Questions Remaining to be Answered */}
<h2 className="text-md mt-6 bg-white border p-2 rounded-lg ">Remaining Questions <strong className = 'text-green-600'>{parseInt(data.Questions.length) - parseInt(Answer.length)} </strong> </h2>

<div className="flex w-full mt-12 items-center justify-center flex-col gap-4">{Question.map((data,index)=>{
    return (
        <QuestionDiv index = {index} key = {index} data={data}/>
    )
})}</div>
   
 



<button 
    onClick={SubmitQuiz} 
   
    className={`text-lg mt-12 transition-colors duration-300 flex gap-2 items-center p-2 rounded-lg ${
        isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 active:bg-white active:text-black active:border shadow-xl active:border-black'
    } text-white`}
>
    {isSubmitting ? 'Evaluating Quiz...' : 'Submit Quiz'} 
    <LuCheck size={20}/>
</button>



       </div>

    </div>)
}
export default Clientside;