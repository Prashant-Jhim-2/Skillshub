'use client'
import Image from "next/image"
import {useState,useEffect, useRef} from 'react'
import { TiMessages } from "react-icons/ti";

import { CgProfile } from "react-icons/cg";
import { MdOutlineFileUpload } from "react-icons/md";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { MdZoomIn, MdZoomOut } from "react-icons/md";
import Link from "next/link";
import { getSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from '@supabase/supabase-js'

import { VscArrowCircleLeft } from "react-icons/vsc";
import { motion } from 'framer-motion';
import { CiSquarePlus } from "react-icons/ci";
import { LuSaveAll } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { MdUploadFile } from "react-icons/md";
import { BsBookHalf } from "react-icons/bs";
import { HiOutlineExternalLink } from "react-icons/hi";
import { BiBookOpen } from "react-icons/bi";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Function to upload file to Supabase Storage
const UploadToSupabase = async (file) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `newpdfs/${fileName}`

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
      url: publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      status: false,
      error: 'Failed to upload file'
    }
  }
}

const Page = ({data}) =>{
  const Router = useRouter()
  const params = useParams()
  const [Loading,setLoading] = useState(true)
  const [Session, setSession] = useState(null)
  const [ProfessorData,ChangeProfessorData] = useState({FullName:"",ImgSrc:"",id:""})
  const [Display,ChangeDisplay] = useState('hidden')
  const [Chapters, ChangeChapters] = useState(data.chapterData)
  const [UploadTitle, ChangeUploadTitle] = useState('')
  const [UploadIndex, ChangeUploadIndex] = useState('')
  const [SelectedFile, ChangeSelectedFile] = useState(null)
  const [PreviewUrl, ChangePreviewUrl] = useState('')
  const [Uploading, ChangeUploading] = useState(false)
  const [PdfViewer, ChangePdfViewer] = useState({display: 'hidden', url: ''})
  const [Content,ChangeContent] = useState('Chapters')
  const [isProfessor, setIsProfessor] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const fileInputRef = useRef(null)
  const iframeRef = useRef(null)
  const [Videos,ChangeVideos] = useState(data.videos)
  const [Quizzes, ChangeQuizzes] = useState(data.quizzes)

  const id = params.id 

  // Function to check if user is enrolled
  const checkEnrollment = async (userId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetEnrolledStudents/${id}`)
      const result = await response.json()
      
      if (result.data) {
        const isEnrolled = result.data.some(student => student.id === userId)
        setIsEnrolled(isEnrolled)
        return isEnrolled
      }
      return false
    } catch (error) {
      console.error('Error checking enrollment:', error)
      return false
    }
  }

  // Function to handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'application/pdf') {
      ChangeSelectedFile(file)
      const url = URL.createObjectURL(file)
      ChangePreviewUrl(url)
    } else {
      alert('Please select a PDF file')
    }
  }

  // Function to handle upload
  const handleUpload = async () => {
    if (!UploadTitle || !SelectedFile) {
      alert('Please provide both title and PDF file')
      return
    }

    try {
      ChangeUploading(true)
      const uploadResult = await UploadToSupabase(SelectedFile)
      
      if (uploadResult.status) {
        // Create chapter object
        const newChapter = {
          title: UploadTitle,
          index: parseInt(UploadIndex) || Chapters.length + 1,
          pdfUrl: uploadResult.url,
          courseId: params.id
        };

        // Send to API
        const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/upload-chapter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newChapter)
        });
        
        const Response = await Request.json();
        
        if (Response.status === true) {
          // Add the new chapter with its ID to the chapters list
          ChangeChapters([...Chapters, { ...newChapter, id: Response.id }]);
          
          // Reset form
          ChangeUploadTitle('');
          ChangeUploadIndex('');
          ChangeSelectedFile(null);
          ChangePreviewUrl('');
          ChangeDisplay('hidden');
        } else {
          alert('Failed to save chapter details');
        }
      } else {
        alert('Upload failed: ' + uploadResult.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      ChangeUploading(false);
    }
  }

  // Function to Check if User is Professor or not
  const CheckUser = async() => {
    try {
      const session = await getSession()
      setSession(session)
      
      if (session?.user?.id === data.Details.ProfessorId) {
        setIsProfessor(true)
       
        setIsEnrolled(true)
        setHasAccess(true)

        setLoading(false)
        
      } else {
        setIsProfessor(false)
        
        // Check if user is enrolled
        const enrolled = await checkEnrollment(session?.user?.id)
        setHasAccess(enrolled)

        setLoading(false)
        if (!enrolled) {
          // Redirect to home if not enrolled and not professor
          Router.push('/home')
        }
      }
    } catch (error) {
      console.error('Error checking user session:', error)
      setIsProfessor(false)
      setIsEnrolled(false)
      setHasAccess(false)
      ChangeDisplay('hidden')
    }
  }

  // Function to Retrieve the data of course 
  const FetchData = async() => {
    const id = data.Details.ProfessorId 
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckID/${id}`)
    const Response = await Request.json()
    if (Response.status == true){
      const Details = Response.Details 
      ChangeProfessorData(Details)
    }
  }

  // Function to handle zoom
  const handleZoom = (type) => {
    const newZoom = type === 'in' ? PdfViewer.zoom + 20 : PdfViewer.zoom - 20;
    if (newZoom >= 50 && newZoom <= 200) {
      ChangePdfViewer(prev => ({...prev, zoom: newZoom}));
      if (iframeRef.current) {
        iframeRef.current.style.transform = `scale(${newZoom / 100})`;
        iframeRef.current.style.transformOrigin = 'top left';
      }
    }
  };

  // Function to handle PDF viewing
  const handlePdfView = (pdfUrl) => {
    ChangePdfViewer({
      display: 'flex',
      url: pdfUrl
    });
  };

  // Function to handle quiz viewing
  const handleQuizView = (quizId) => {
    // Navigate to quiz page
    Router.push(`/quiz/${quizId}`);
  };

  // Function to fetch quizzes for this course
  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PORT}/GetQuizzesByCourse/${id}`);
      const result = await response.json();
      
      if (result.status === true) {
        ChangeQuizzes(result.data);
      } else {
        console.error('Failed to fetch quizzes:', result.message);
        ChangeQuizzes([]);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      ChangeQuizzes([]);
    }
  };

  useEffect(() => {
    CheckUser()
    FetchData()
    fetchQuizzes()
  }, [])
  if (Loading){
    return (
      <div
      style={{
          backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/Bgimage%2F16332411_rm347-porpla-02-a-01.jpg?alt=media&token=f1c411b1-8b64-4b5d-a45c-cc34d21f0973')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
      }}
      className="flex relative w-full min-h-screen flex-col justify-center items-center px-4">

               <h1 className="flex bg-white/80 backdrop-blur-sm p-2 rounded-md gap-1 absolute self-center font-bold text-lg top-20 z-30">
                    <label className="text-orange-600">EduCorner</label> 
                    <label className="text-blue-600">Tutoring</label> 
                    <span className="text-gray-600">/Course</span>
                </h1>

                <div className="w-80 shadow-2xl rounded-xl flex py-12 bg-white/80 backdrop-blur-sm p-2 rounded-md gap-1 flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-16  w-16 border-b-2 border-black"></div>
                  <label className="text-sm mt-6 ">Please wait until we load the data </label>
                </div>
      </div>
    )
  }
  // If user doesn't have access, don't render the content
  if (!hasAccess) {
    return (
      <div 
        style={{
          backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/Bgimage%2F16332411_rm347-porpla-02-a-01.jpg?alt=media&token=f1c411b1-8b64-4b5d-a45c-cc34d21f0973')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        className="flex items-center justify-center min-h-screen">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-200 text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Access Denied</h1>
          <p className="mb-6 text-gray-600">You need to be enrolled in this course to view its content.</p>
          <Link href="/home">
            <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300 shadow-lg">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
    style={{
      backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/fosystem2-86a07.appspot.com/o/Bgimage%2F16332411_rm347-porpla-02-a-01.jpg?alt=media&token=f1c411b1-8b64-4b5d-a45c-cc34d21f0973')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
  }}
    className="flex flex-col items-center justify-center relative min-h-screen p-4">

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-6xl mb-6">
        <Link href="/home">
          <button className="flex gap-2 items-center justify-center text-gray-600 hover:text-black bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg transition-colors">
            <VscArrowCircleLeft size={20}/>Back to Home
          </button>
        </Link>
        
        
      </div>
      <h1 className="flex bg-white/80 backdrop-blur-sm p-3 rounded-lg gap-1 font-bold text-lg shadow-lg">
          <label className="text-orange-600">TryMyBoard</label> 
          <span className="text-gray-600">/Course</span>
        </h1>

      {/* Main Content Container */}
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 p-8 space-y-8 overflow-y-auto max-h-[85vh]">
        
        {/* Course Header Section */}
        <div className="flex flex-col  items-center gap-8">
          {/* Course Image */}
          <div className="flex-shrink-0">
            <Image 
              className="rounded-xl shadow-xl border-4 border-white" 
              src={data.Details.ImgSrc} 
              width={300} 
              height={300} 
              alt="Course Image"
            />
          </div>

          {/* Course Details */}
          <div className="flex flex-col text-center lg:text-left space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">{data.Details.Name}</h1>
            <h2 className="text-xl font-semibold text-gray-700">Description</h2>
            <p className="text-gray-600 leading-relaxed">
              {data.Details.Description}
            </p>
            
            {/* Course Chat Button */}
            <div className="pt-4 w-full flex justify-center">
              <Link href={`/CourseChat/${params.id}`}>
                <button className="bg-black flex gap-2 items-center justify-center text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-lg">
                  Open Course Chat
                  <TiMessages size={20}/>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Professor Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Professor</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 bg-white rounded-lg shadow-md">
            <Image 
              className="h-24 w-24 object-cover rounded-full border-4 border-gray-200" 
              src={ProfessorData.ImgSrc} 
              width={100} 
              height={100}
              alt="Professor Profile"
            />
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-800">{ProfessorData.FullName}</h2>
              <label className="text-sm text-gray-500 mb-4">Professor Till 2023</label>
              <Link href={`/profile/${ProfessorData.id}`}>
                <button className="bg-black active:bg-white active:text-black active:border-black flex items-center justify-center gap-2 border shadow-lg text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  View Profile
                  <CgProfile size={20} />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Course Content Section */}
        <div className="bg-white/80 relative backdrop-blur-sm rounded-xl shadow-lg border  border-gray-200 p-6 space-y-6">
          {Content == "Chapters" &&  <div className="flex mb-24 mt-16 flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex self-center mt-6 w-full items-center justify-center gap-2">
          
           <button onClick={() => ChangeContent('Chapters')} className="text-xl rounded-xl shadow-xl  bg-white border-2 border-black p-3 text-rose-600 font-bold ">Chapters</button>
           //
           <button onClick={() => ChangeContent('Quiz')} className="text-2xl transition-colors duration-200 active:font-bold active:text-rose-600  text-gray-800">Quiz</button>
           </div>
            
          </div>}
          {Content == "Quiz" &&  <div className="flex mb-24 mt-16 flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex self-center w-full mt-6 items-center justify-center gap-2">
           <button onClick={() => ChangeContent('Quiz')} className="text-xl rounded-xl shadow-xl  bg-white border-2 border-black p-3 text-rose-600 font-bold ">Quiz</button>
           
           //
           <button onClick={() => ChangeContent('Chapters')} className="text-2xl transition-colors duration-200 active:font-bold active:text-rose-600  text-gray-800">Chapters</button>
           </div>
            
          </div>}

          {isProfessor && Content == "Chapters" && (
              <button 
                onClick={() => ChangeDisplay('flex')} 
                className="flex absolute top-2 right-2 items-center justify-center gap-2 border px-4 py-3 bg-black text-white rounded-lg active:bg-white active:text-black active:border-black shadow-lg hover:bg-gray-800 transition-colors"
              >
                <MdOutlineFileUpload size={20} />
                Add Chapter
              </button>
            )}
            {isProfessor && Content == "Quiz" && (
              <button 
                onClick={() => {
                  Router.push(`/CreateQuiz`)
                }} 
                className="flex absolute top-2 right-2 items-center justify-center gap-2 border px-4 py-3 bg-black text-white rounded-lg active:bg-white active:text-black active:border-black shadow-lg hover:bg-gray-800 transition-colors"
              >
                <MdOutlineFileUpload size={20} />
                Add Quiz
              </button>
            )}

          {/* Chapters List */}
          <div className="flex flex-wrap items-center justify-center gap-6">
           {Content == 'Chapters' ? <> {Chapters.map((chapter) => (
              <div key={chapter.id} className="flex flex-col border shadow-lg p-4 w-80 justify-start bg-white rounded-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    {chapter.index}
                  </div>
                  <h1 className="text-lg font-semibold">{chapter.title}</h1>
                </div>
                <button 
                  onClick={() => handlePdfView(chapter.pdfUrl)}
                  className="bg-black active:bg-white active:text-black active:border-black flex items-center justify-center gap-2 border shadow-lg text-white px-3 py-2 rounded mt-3 hover:bg-gray-800 transition-colors"
                >
                  View Chapter
                </button>
              </div>
            ))}</> : <></>}
          </div>

          {/* Quiz List */}
          {Content == 'Quiz' && (
            <div className="flex flex-wrap items-center justify-center gap-6">
              {Quizzes && Quizzes.length > 0 ? (
                Quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex flex-col border shadow-lg p-6 w-80 justify-start bg-white rounded-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                        📝
                      </div>
                      <h1 className="text-lg font-semibold">{quiz.Name}</h1>
                    </div>
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <p><strong>Course:</strong> {quiz.CourseName}</p>
                      <p><strong>Due Date:</strong> {quiz.DueDate} at {quiz.DueTime}</p>
                      <p><strong>Time Limit:</strong> {quiz.TimeLimit} minutes</p>
                      <p><strong>Total Marks:</strong> {quiz.Marks}</p>
                    </div>
                    <button 
                      onClick={() => handleQuizView(quiz.id)}
                      className="bg-blue-600 active:bg-white active:text-blue-600 active:border-blue-600 flex items-center justify-center gap-2 border shadow-lg text-white px-4 py-3 rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                      Take Quiz
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No quizzes available yet.</p>
                  {isProfessor && (
                    <p className="text-gray-400 text-sm mt-2">Click "Add Quiz" to get started.</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          {Chapters.length === 0 && Content == 'Chapters' && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No chapters available yet.</p>
              {isProfessor && (
                <p className="text-gray-400 text-sm mt-2">Click "Add Chapter" to get started.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal - Only accessible for professor */}
      {isProfessor && (
        <div className={`fixed inset-0 top-0 bg-black bg-opacity-50 ${Display} items-center justify-center z-50`}>
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">Upload Chapter</h2>
              </div>
              <button onClick={() => ChangeDisplay('hidden')} className="text-gray-500 hover:text-gray-700">
                <IoMdCloseCircleOutline size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chapter Title</label>
                <input
                  type="text"
                  value={UploadTitle}
                  onChange={(e) => ChangeUploadTitle(e.target.value)}
                  className="mt-1 h-12 block w-full active:rounded-md border-b border-b-black outline-black p-2 shadow-sm focus:border-black focus:ring-black"
                  placeholder="Enter chapter title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Chapter Index (Optional)</label>
                <input
                  type="number"
                  value={UploadIndex}
                  onChange={(e) => ChangeUploadIndex(e.target.value)}
                  className="mt-1 h-12 block w-full active:rounded-md border-b border-b-black p-2 shadow-sm focus:border-black focus:ring-black"
                  placeholder="Enter chapter index"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">PDF File</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="mt-1 block w-full border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-black"
                >
                  {SelectedFile ? SelectedFile.name : 'Click to select PDF file'}
                </button>
              </div>

              {PreviewUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">PDF Preview</label>
                  <iframe
                    src={PreviewUrl}
                    className="w-full h-96 border rounded-lg"
                    title="PDF Preview"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => ChangeDisplay('hidden')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={Uploading}
                  className={`px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 ${Uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {Uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <div className={`fixed inset-0 bg-black ${PdfViewer.display} items-center justify-center z-50`}>
        <div className="w-full h-full flex flex-col">
          <div className="flex justify-between items-center p-4 bg-white shadow-md">
            <h2 className="text-xl font-bold">Chapter Content</h2>
            <button 
              onClick={() => ChangePdfViewer({display: 'hidden', url: ''})} 
              className="text-gray-500 hover:text-gray-700"
            >
              <IoMdCloseCircleOutline size={24} />
            </button>
          </div>
          <div className="flex-1 w-full h-full relative">
            {PdfViewer.display === 'flex' && (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(PdfViewer.url)}&embedded=true`}
                className="w-full h-full absolute inset-0"
                title="PDF Viewer"
                allow="fullscreen"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Page 
