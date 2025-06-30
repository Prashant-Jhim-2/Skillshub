'use client' 

import { useEffect,useState,useRef } from "react";
import { LuClock5 } from "react-icons/lu";
import { FaCheck } from "react-icons/fa";
import Image from "next/image";
import { LuFileUp } from "react-icons/lu";
import { MdOutlinePreview } from "react-icons/md";
import { LuCheck } from "react-icons/lu";
import { LuInfo } from "react-icons/lu";
import { useParams } from "next/navigation"; 
import { getSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import dynamic from 'next/dynamic';
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
  
  



// Dynamically import PDF processor to avoid SSR issues
const PDFProcessor = dynamic(() => import('./PDFProcessor'), {
    ssr: false,
    loading: () => null
});

const Clientside = ({data})=>{
    const session = getSession()
    const params = useParams()
    const [UserDetails,SetUserDetails] = useState({id:undefined,Name:undefined,Email:undefined})
    const [Display,ChangeDisplay] = useState(false)
    const [TotalMarks,setTotalMarks] = useState(0)
    const [OutofMarks,setOutofMarks] = useState(0)
   
    const [isAcknowledged,setIsAcknowledged] = useState(false)
    const [SubmittedorNot,setSubmittedorNot] = useState(false)
    const [EvalorSuccess,setEvalorSuccess] = useState("")
  
    const [Question,setQuestion] = useState(data.Questions)
    const [RemainingQuestions,setRemainingQuestions] = useState(data.Questions.length)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    
    // Fetch Quiz Answers 
    const FetchQuizAnswers = async(user)=>{
        const id = UserDetails.id || user
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/FetchStudentAnswers/${params.id}/${id}`)
        const Response = await Request.json()
    if (Response.status == true){
        setSubmittedorNot(Response.Submitted)
        setTotalMarks(0)
        setOutofMarks(0)
 
        Response.answers.map((Ans)=>{
            setTotalMarks(prev=>prev+Ans.GainedMarks)
            setOutofMarks(prev=>prev+Ans.Marks)
        })

        if (Response.Submitted == true){
            setIsAcknowledged(true)
        }
        ChangeDisplay(true)
        return Response.answers
    }
    else{
        return null
    }
    }
    const callup = async(user)=>{
        const Answers = await FetchQuizAnswers(user) 
        if (Answers != null){
            const Answered = Answers.filter((Ans)=>{
                if (Ans.Answer != null && Ans.Answer != ''){
                    return Ans
                }
            })
            setRemainingQuestions(data.Questions.length - Answered.length)
            setQuestion(Answers)
        }
    }


    useEffect(()=>{
       
       
        const fetchUserDetails = async()=>{
            const User = await checkauth()
            console.log(User)
            if (User){
                SetUserDetails(User)
                callup(User.id)

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

   // Function to Check The Quiz 
   const CheckQuiz = async()=>{
    setEvalorSuccess("Evaluate")
    setIsSubmitting(true)
    const Answers = await FetchQuizAnswers()
    console.log(Answers)

    if (!Answers || Answers.length === 0) {
        alert("No answers found to evaluate")
        setIsSubmitting(false)
        return
    }

    const prompt = `You are an expert quiz evaluator but be less strict. Please evaluate the following quiz answers based on the questions provided.

QUIZ INFORMATION:
- Quiz Name: ${data.Name}
- Total Questions: ${Answers.length}
- 

QUESTIONS AND STUDENT ANSWERS:
${Answers.map((Ans) => {
    return `{
    "Question": "${Ans.Question}",
    "Answer": "${Ans.Answer}",
    "File": "${Ans.File || 'null'}",
    "GainedMarks": "${Ans.GainedMarks}",
    "Marks": "${Ans.Marks}",
    "Options": "${Ans.Options || 'null'}",
    "QuestionType": "${Ans.QuestionType}",
    "RightOption": "${Ans.RightOption || 'null'}"
}`
}).join(",\n")}

EVALUATION INSTRUCTIONS:
1. For MCQ questions: SKIP - These are already graded automatically by the system
2. For Text questions: Evaluate the quality, accuracy, and completeness of the response
3. For File Upload questions: 
   - Evaluate the extracted text content from the uploaded PDF
   - Consider the relevance and quality of the content
   - Check if the uploaded content addresses the question properly
   - Assess the completeness and accuracy of the extracted text
4. Provide detailed feedback for each question (except MCQs)
5. Assign appropriate marks based on answer quality
6. Be fair and constructive in your evaluation
7. If the answer is not present then give 0 marks
8. If the answer is present but not correct then give 0 marks 
9. if answer is present but not relevant to the question then give 0 marks  
10 if answer is present but covers the should be answer then give marks based on the answer  it can be like can be float [1.2] or can be integer [13] / out of total marks
11. if question have high marks that means the answer should be more detailed and should be more relevant to the question
12. if question have low marks that means the answer should be less detailed and should be less relevant to the question

Please provide your evaluation in JSON format with the following structure for each answer:
{
  "answer": [
    {
      "Answer": "string",
      "File": "null" || "already present field",
      "GainedMarks": "marks graded after evaluation",
       "Marks": "already present field",
      "Options": "null" || "already present field",
      "Question": "Question",
      "QuestionType": "null" || "already present field",
      "RightOption": "null" || "already present field",
      "Feedback": "not for Mcq if mcq then null"|| "Feedback of the answer" 
    }
  ]
}

IMPORTANT: 
- Respond only with valid JSON. Do not include any additional text before or after the JSON response.
- For MCQ questions, set "GainedMarks":  Leave it as it is 
- For Text and File Upload questions, provide appropriate "GainedMarks" based on evaluation.
- all provide partial marks for the answer if the answer is not correct but relevant to the question then provide partial marks
- Keep all original fields intact and add the evaluation marks.
- before providing the response please check the gained marks and feedbacks are relevant to each other and marked correctly
- The "answer" array should contain the same structure as the original answers with added evaluation fields.`

    
        const response = await fetch('/api/openai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: prompt,
                maxTokens: 2000,
                temperature: 0.3
            })
        })

        if (!response.ok) {
            throw new Error('Failed to evaluate quiz')
        }

        const result = await response.json()
        console.log(result)
        
        // The response is already an object, no need to parse
        const evaluationResult = result.content || result.text || result
       
        
        // Parse the answers array from the evaluation result
        const parsedAnswers = JSON.parse(evaluationResult.answer)
        

        const NewAnswers = parsedAnswers.answer.map((Ans,index)=>{
            
                return {
                
                    Answer: Ans.Answer ,
                    File: Ans.File == "null" ? null : Ans.File ,
                    GainedMarks:parseFloat(Ans.GainedMarks),
                    Marks: parseFloat(Ans.Marks),
                    Options: Ans.Options == "null" ? null : Answers[index].Options ,
                    Question: Ans.Question,
                    QuestionType: Ans.QuestionType,
                    RightOption: Ans.RightOption == "null" ? null : Answers[index].RightOption,
                    Feedback: Ans.Feedback
            }
            
                
                
            
        })
        const ReqtoSubmit = await fetch(`${process.env.NEXT_PUBLIC_PORT}/SubmitQuiz`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({id:params.id,Student:UserDetails.id,Answers:NewAnswers})
        })
        const Response = await ReqtoSubmit.json()
        console.log(Response)
        if (Response.status == true){
            // Trigger check animation after a short delay
        setTimeout(() => {
            
            setEvalorSuccess("Success")
        }, 500)
        }
        else{
            alert("Error in Submitting Quiz")
            setEvalorSuccess("")
            setIsSubmitting(false)
        }
        
        
        
        
       
    }

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

    
        

    // Function for Counting the Time to prevent the page from refreshing\
    const CountingTime = ()=>{
        const [Minutes,setMinutes] = useState(parseInt(data.TimeLimit) -1)
        const [timeinSeconds,setTimeinSeconds] = useState(60)
       

       useEffect(()=>{
        if (SubmittedorNot == false){
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
        }
        
       
       },[])

       if (SubmittedorNot == false){
        return (
            
       
                <div className="flex fixed bg-white border text-md top-2 right-2 p-2  rounded-lg  gap-2 items-center justify-center ">
                
                     Time Left :
                     <LuClock5 size={20} />
                     <h1 className="font-bold  text-green-600">{Minutes}:{timeinSeconds < 10 ? '0' + timeinSeconds : timeinSeconds} Minutes </h1>
                     
                     
                </div>)
       }
       
    }


    
   

    // Question Div 
    const QuestionDiv = (props)=>{
        const [saving,savingornot] = useState(false)
        const [Answer,setAnswer] = useState(props.data.Answer || '')
       
        
        const [filetext,setfiletext] = useState('')
        const [fileurl,setfileurl] = useState(props.data.File || undefined)
        const [filename,setfilename] = useState(props.data.File ? 'Uploaded File' : null)
        const [Processing,setProcessing] = useState(false)
        const [selectedFile, setSelectedFile] = useState(null)
        const Question = props.data

        // Initialize with existing data when component mounts
        useEffect(() => {
            if (props.data.Answer) {
                setAnswer(props.data.Answer)
            }
            if (props.data.File) {
                setfileurl(props.data.File)
                setfilename('Uploaded File')
            }
        }, [props.data])

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
            
            // Set filename and file
            setfilename(file.name)
            setSelectedFile(file)
            setProcessing(true)
        }

       
        

        const handleClear = () => {
            setfilename('')
            setfiletext('')
            setfileurl('')
            setProcessing(false)
            setSelectedFile(null)
            hearchange('')
            // Reset the file input
            const fileInput = document.getElementById(`file-input-${props.index}`)
            if (fileInput) {
                fileInput.value = ''
            }
        }

        const handleTextExtracted = async (text) => {
            setfiletext(text)
            console.log('Extracted text:', text)
            
            // Upload file and handle result
            const uploadResult = await UploadToSupabase(selectedFile, params.id, UserDetails.id)
            
            if (uploadResult.status == true) {
                console.log('File uploaded successfully:', uploadResult.Url)
                setfileurl(uploadResult.Url)
                hearchange(text, uploadResult.Url)
                savingornot(true)
            } else {
                console.error('Upload failed:', uploadResult.error)
                alert('File upload failed: ' + uploadResult.error)
            }
            
            setProcessing(false)
        }

        const handlePDFError = (error) => {
            console.error('PDF processing error:', error)
            alert(error)
            setProcessing(false)
        }

        const hearchange = async(value,url) =>{
            console.log(url)
            savingornot(true)
            console.log({
                TotalMarks:data.Marks,
                Quiz:params.id,
                Student:UserDetails.id,
                details:{index:props.index,File:url||null,...props.data,Answer:value},
                Answer :value,
                
            })

            var Answer = {
                    TotalMarks:data.Marks,
                    Quiz:params.id,
                    Student:UserDetails.id,
                    details:{index:props.index,File:url||null,...props.data,Answer:value},
                    Answer : value ,
                    
                }
            
            const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/SaveQuiz`,{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(Answer)
            })
            const Response = await Request.json()
            if (Response.status == true){
                setTimeout(()=>{
                    savingornot(false)
                    callup()
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
                value = {Answer}
                disabled = {SubmittedorNot}
                onChange = {(e)=>{
                    setAnswer(e.target.value)
                    hearchange(e.target.value)
                }}
                placeholder="Enter your answer here" 
                className="w-full text-base h-64 p-2 border-2 outline-black border-black rounded-lg" 
            />
            </>}
            {Question.QuestionType == "File Upload"&&<>
            <div className="flex flex-col gap-4 w-full">
                {/* PDF Processor Component */}
                {selectedFile && (
                    <PDFProcessor
                        file={selectedFile}
                        onTextExtracted={handleTextExtracted}
                        onError={handlePDFError}
                        onProcessing={setProcessing}
                    />
                )}
                
                {!fileurl && <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input 
                        type="file" 
                        disabled = {SubmittedorNot || Processing}
                        onChange={hearfilechange}
                        accept=".pdf"
                        className="hidden"
                        id={`file-input-${props.index}`}
                    />
                    <label 
                        htmlFor={`file-input-${props.index}`}
                        className={`cursor-pointer flex flex-col items-center gap-2 ${Processing ? 'opacity-50' : ''}`}
                    >
                        <LuFileUp size={40} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                            {Processing ? 'Processing PDF...' : 'Click to upload PDF file (max 10MB)'}
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
                            disabled = {SubmittedorNot}
                                onClick = {()=>{
                                    setAnswer(data.value)
                                    hearchange(data.value)
                                }}
                                type="radio" 
                                className = 'w-6 h-6' 
                                name={`option-${props.index}`}
                                id={`option-${props.index}-${optionIndex}`}
                                checked={Answer === data.value}
                            />
                            <label htmlFor={`option-${props.index}-${optionIndex}`}>{data.value}</label>
                        </div>
                    )
                })}
                    
            </div>

            </>}
            <label></label>
            
            {/* Enhanced Feedback Section */}
            {(Question.GainedMarks !== undefined && Question.GainedMarks !== null && Question.Feedback != undefined && Question.Feedback != null && SubmittedorNot == true) && (
                <div className={`flex mt-6 items-center border p-4 shadow-xl rounded-lg justify-center flex-col transition-colors duration-300 ${
                    Question.Marks > 0 
                        ? (Question.GainedMarks / Question.Marks) * 100 < 50 
                            ? 'border-rose-300 bg-rose-50' 
                            : (Question.GainedMarks / Question.Marks) * 100 < 75 
                                ? 'border-orange-300 bg-orange-50' 
                                : 'border-green-300 bg-green-50'
                        : 'border-green-300 bg-green-50'
                }`}>
                    <h1 className={`text-md font-bold rounded-lg ${
                        Question.Marks > 0 
                            ? (Question.GainedMarks / Question.Marks) * 100 < 50 
                                ? 'text-rose-800' 
                                : (Question.GainedMarks / Question.Marks) * 100 < 75 
                                    ? 'text-orange-800' 
                                    : 'text-green-800'
                            : 'text-green-800'
                    }`}>
                        Evaluation Results
                    </h1>
                    <div className={`flex items-center border p-2 shadow-xl rounded-lg gap-2 mt-2 ${
                        Question.Marks > 0 
                            ? (Question.GainedMarks / Question.Marks) * 100 < 50 
                                ? 'border-rose-400 bg-rose-100' 
                                : (Question.GainedMarks / Question.Marks) * 100 < 75 
                                    ? 'border-orange-400 bg-orange-100' 
                                    : 'border-green-400 bg-green-100'
                            : 'border-green-400 bg-green-100'
                    }`}>
                        <span className={`text-sm font-semibold ${
                            Question.Marks > 0 
                                ? (Question.GainedMarks / Question.Marks) * 100 < 50 
                                    ? 'text-rose-700' 
                                    : (Question.GainedMarks / Question.Marks) * 100 < 75 
                                        ? 'text-orange-700' 
                                        : 'text-green-700'
                                : 'text-green-700'
                        }`}>
                            Gained Marks:
                        </span>
                        <span className={`text-xl font-bold ${
                            Question.Marks > 0 
                                ? (Question.GainedMarks / Question.Marks) * 100 < 50 
                                    ? 'text-rose-600' 
                                    : (Question.GainedMarks / Question.Marks) * 100 < 75 
                                        ? 'text-orange-600' 
                                        : 'text-green-600'
                                : 'text-green-600'
                        }`}>
                            {Question.GainedMarks}
                        </span>
                        <span className={`text-sm ${
                            Question.Marks > 0 
                                ? (Question.GainedMarks / Question.Marks) * 100 < 50 
                                    ? 'text-rose-600' 
                                    : (Question.GainedMarks / Question.Marks) * 100 < 75 
                                        ? 'text-orange-600' 
                                        : 'text-green-600'
                                : 'text-green-600'
                        }`}>
                            out of {Question.Marks}
                        </span>
                    </div>
                    {Question.Feedback && (
                        <div className="mt-3 w-full">
                            <label className={`text-sm font-semibold ${
                                Question.Marks > 0 
                                    ? (Question.GainedMarks / Question.Marks) * 100 < 50 
                                        ? 'text-rose-700' 
                                        : (Question.GainedMarks / Question.Marks) * 100 < 75 
                                            ? 'text-orange-700' 
                                            : 'text-green-700'
                                    : 'text-green-700'
                            }`}>
                                Feedback:
                            </label>
                            <p className={`text-lg mt-1 bg-white p-2 rounded border ${
                                Question.Marks > 0 
                                    ? (Question.GainedMarks / Question.Marks) * 100 < 50 
                                        ? 'text-rose-800 border-rose-200' 
                                        : (Question.GainedMarks / Question.Marks) * 100 < 75 
                                            ? 'text-orange-800 border-orange-200' 
                                            : 'text-green-800 border-green-200'
                                    : 'text-green-800 border-green-200'
                            }`}>
                                {Question.Feedback}
                            </p>
                        </div>
                    )}
                </div>
            )}
          </div>

        )
    
    }



   
        

       if (Display ==  true ){
         return(
    <div 
        
        className="w-full">
        
       <div className="flex   flex-col items-center pt-16 min-h-screen">
         {/* Header Part */}
         <h1 className="text-xl  text-blue-800 p-2 bg-white/70 rounded-lg backdrop-blur-sm shadow-xl border ">TryMyBoard  / <span className="text-orange-600">Quiz</span></h1>


        {SubmittedorNot && (
            <label className={`text-lg top-1 z-50 fixed top-0 right-2 text-white font-bold border p-2 rounded-lg transition-colors duration-300 ${
                OutofMarks > 0 
                    ? (TotalMarks / OutofMarks) * 100 < 50 
                        ? 'bg-rose-600' 
                        : (TotalMarks / OutofMarks) * 100 < 75 
                            ? 'bg-orange-500' 
                            : 'bg-green-600'
                    : 'bg-green-600'
            }`}>
                Scored Marks : {TotalMarks} out of {OutofMarks}
            </label>
        )}
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
 {!SubmittedorNot&&<h2 className="text-md mt-6 bg-white border p-2 rounded-lg ">Remaining Questions <strong className = 'text-green-600'>{RemainingQuestions}</strong> </h2>}

<div className="flex w-full mt-12 items-center justify-center flex-col gap-4">{Question.map((data,index)=>{
    return (
        <QuestionDiv index = {index} key = {index} data={data}/>
    )
})}</div>

{EvalorSuccess != '' && <div className='w-screen h-screen bg-black/50 backdrop-blur-sm fixed top-0 left-0 z-10'></div>}

{EvalorSuccess == "Success"&&<>

        <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-lg shadow-xl'>
            <div className='flex items-center justify-center p-6 flex-col gap-2'>
                <FaCheck 
                    size={50} 
                    className={`transition-all duration-1000 ease-in-out 
                             text-green-600 scale-150
                             
                    `}
                />
                <h1 className='text-lg font-bold'>Quiz Submitted Successfully</h1>
                <p className='text-sm'>Thank you for submitting the quiz.</p>
                <button 
                    onClick = {()=>{
                        setEvalorSuccess("")
                        FetchQuizAnswers()
                    }}
                    className='bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors'
                >
                    Close
                </button>
            </div>
        </div></>}


        {EvalorSuccess == "Evaluate"&&<>

<div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white p-4 rounded-lg shadow-xl'>
    <div className='flex items-center justify-center p-6 flex-col gap-2'>
        <div className = 'w-16 h-16 rounded-full border-b-4 border-b-green-600 animate-spin'></div>
        <h1 className='text-lg font-bold'>Evaluating Quiz</h1>
        <p className='text-sm'>Please Wait While We Evaluate Your Quiz.</p>
        
    </div>
</div></>}
    
        
   

 {!SubmittedorNot&&<button 
    onClick={CheckQuiz} 
   
    className={`text-lg mt-12 transition-colors duration-300 flex gap-2 items-center p-2 rounded-lg text-white bg-green-600 active:bg-white active:text-black active:border shadow-xl active:border-black`} >
    <LuCheck size={20}/>
    Submit Quiz 
</button>}



       </div>

    </div>)
       }

       if (Display == false){
        return (
            <div className = 'w-screen h-screen bg-black/50 backdrop-blur-sm fixed top-0 left-0 z-10 flex items-center justify-center'>

                <div className = 'flex flex-col items-center p-6 bg-white justify-center gap-2 shadow-xl rounded-lg'>
                    <div className = 'w-16 h-16 rounded-full border-b-4 border-b-black animate-spin'></div>
                    <label className = 'text-lg font-bold'>Loading...</label>
                    <label className = 'text-sm text-gray-600'>Please Wait While We Load The Quiz</label>
                </div>
            </div>
        )
       }
}

export default Clientside;