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
  const [isProfessor, setIsProfessor] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const fileInputRef = useRef(null)
  const iframeRef = useRef(null)
  const [Videos,ChangeVideos] = useState(data.videos)

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
        
      } else {
        setIsProfessor(false)
        // Check if user is enrolled
        const enrolled = await checkEnrollment(session?.user?.id)
        setHasAccess(enrolled)
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

  useEffect(() => {
    CheckUser()
    FetchData()
  }, [])

  // If user doesn't have access, don't render the content
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You need to be enrolled in this course to view its content.</p>
          <Link href="/home">
            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center relative min-h-screen">
      {/* Header */}
      <div className="relative w-full mt-12">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-2xl font-bold">Educorner Tutoring📝</h1>
        </div>
      </div>

      <Link href="/home">
            <button className="flex absolute left-2 top-2 gap-2 items-center justify-center text-gray-600 hover:text-black">
              <VscArrowCircleLeft size={20}/>Back to Course
            </button>
          </Link>

      {/* Main Content */}
      <div className="w-full max-w-4xl px-4 py-6 space-y-8">
        {/* Course Image */}
        <div className="flex flex-col items-center">
          <Image 
            className="rounded-lg shadow-lg border" 
            src={data.Details.ImgSrc} 
            width={300} 
            height={300} 
            alt="Course Image"
          />
        </div>

        {/* Course Details */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{data.Details.Name}</h1>
          <h2 className="text-xl font-bold">Description</h2>
          <p className="w-full max-w-2xl mx-auto">
            {data.Details.Description}
          </p>
        </div>

        {/* Course Chat Button */}
        <div className="flex justify-center">
          <Link href={`/CourseChat/${params.id}`}>
            <button className="bg-black flex gap-2 items-center justify-center text-white p-3 rounded-lg hover:bg-gray-800 transition-colors">
              Open Course Chat
              <TiMessages size={20}/>
            </button>
          </Link>
        </div>

        {/* Professor Section */}
        <div className=" w-full flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-center">Professor</h2>

          <div className="  w-80  flex  items-center justify-center gap-4 p-4 bg-white">
            <Image 
              className=" h-24 w-24 object-cover" 
              src={ProfessorData.ImgSrc} 
              width={100} 
              height={100}
              alt="Professor Profile"
            />

            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">{ProfessorData.FullName}</h2>
              <label className="text-xs text-gray-500">Professor Till 2023</label>
              <Link href={`/profile/${ProfessorData.id}`}>
                <button className="bg-black active:bg-white active:text-black active:border-black flex items-center justify-center gap-2 border shadow-lg text-white px-3 py-2 rounded mt-3">
                  View Profile
                  <CgProfile size={20} />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Course Content Section */}
        <div className="space-y-4 w-full flex flex-col items-center justify-center">
          {isProfessor && (
            <div className="flex flex-col gap-2 items-center justify-center w-80">
              <button 
                onClick={() => ChangeDisplay('flex')} 
                className="flex items-center justify-center gap-2 border px-3 mb-12 py-2 bg-black text-white rounded-lg active:bg-white active:text-black active:border-black shadow-lg"
              >
                <MdOutlineFileUpload size={20} />
                Add Chapter
              </button>
            </div>
          )}
          <h2 className="text-2xl font-bold">Chapters</h2>

          {/* Chapters List */}
          <div className="flex flex-col items-center justify-center gap-4 w-80 mx-auto">
            {Chapters.map((chapter) => (
              <div key={chapter.id} className="flex flex-col border shadow-lg p-4 w-full justify-start bg-white rounded-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    {chapter.index}
                  </div>
                  <h1 className="text-lg font-semibold">{chapter.title}</h1>
                </div>
                <button 
                  onClick={() => handlePdfView(chapter.pdfUrl)}
                  className="bg-black active:bg-white active:text-black active:border-black flex items-center justify-center gap-2 border shadow-lg text-white px-3 py-2 rounded mt-3"
                >
                  View Chapter
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Content Button - Only show for professor */}
        {isProfessor && (
          <button 
            onClick={() => ChangeDisplay('flex')} 
            className={`mt-4 ${Display} items-center justify-center gap-2 border px-4 py-2 bg-black text-white rounded-lg active:bg-white active:text-black active:border-black shadow-lg mx-auto`}
          >
            Upload Content <MdOutlineFileUpload size={30} />
          </button>
        )}

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
    </div>
  )
}
export default Page 
