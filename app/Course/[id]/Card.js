import Image from "next/image"


const Card = () =>{
    return (
        <div className = 'flex relative md:w-[375px] sm:w-[375px] xs:w-[375px] lg:w-96 xl:w-96 2xl:w-96 flex-col mb-6 border shadow-lg'>
           <div className = ''>
            <Image 
            src = 'https://unsplash.com/photos/ZPeXrWxOjRQ/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzM2MDM5MzIyfA&force=true'
            width={300} 
          height={200} 
          layout="responsive" 
          objectFit="cover" 
          className="" 
            />
           </div>
        <div className ='p-4'>
        <button className = 'absolute top-2 right-2 bg-blue-300 text-xl w-12 rounded-full h-12'>1</button>
        <h3 className="text-xl font-semibold mb-2">Machine Learning</h3>
        <p className="text-gray-600 text-sm">This Chapter  Will Provide Basic Knownledge of Python</p>
        <button className =  'px-4 py-2 border border-black shadow-button mt-3 rounded-lg'>Play Video</button>
        </div>
        </div>
    )
}
export default Card