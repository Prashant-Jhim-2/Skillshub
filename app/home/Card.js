import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookPlus } from 'lucide-react';
import { Navigation } from 'lucide-react';
import { FilePenLine } from 'lucide-react';

const Card = ({ data,enrolled,Verify}) => {
   
  
     const Enrolled = enrolled
     console.log(`${data.Name}     ${Verify}`)
    const Router = useRouter()
    const {
        id,
        Description,
        Duration,
        Field,
        Format,
        ImgSrc,
        Level,
        Name,
        Price,
        PriceType,
        ProfessorID,
        Topics,
    } = data;

    const handleEnroll = () => {
       
       Router.push(`/courses/${id}`);

    };
    const handlegotocourse = () =>{
        Router.push(`/Course/${id}`);
    }


    return (
        <div className="w-80 mb-6  relative rounded overflow-hidden shadow-lg bg-white">
            <div className="relative w-full h-48">
                <Image className="object-cover" src={ImgSrc} alt={Name} layout="fill" />
            </div>
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{Name}</div>
                <p className="text-gray-700 text-base">{Description}</p>
                <div className="mt-4">
                    <p className="text-md text-gray-600">Field: {Field}</p>
                    <p className="text-md text-gray-600">Level: {Level}</p>
                    <p className="text-md text-gray-600">Duration: {Duration}</p>
                    <p className="text-md text-gray-600">Price: ${Price}</p>
                    <div className="mt-2">
                        <p className="text-sm text-gray-600 font-semibold">Topics:</p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            {Topics.map((topic) => (
                                <span key={topic.index} className="bg-green-600 text-white px-2 py-1 rounded">
                                    {topic.Name}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm text-gray-600 font-semibold">Format:</p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            {Format.map((format) => (
                                <span key={format.index} className="bg-green-600 text-white px-2 py-1 rounded">
                                    {format.Name}
                                </span>
                            ))}
                        </div>
                    </div>
                    {!Enrolled && !Verify && <button 
                        className="mt-4 flex gap-1 border active:border-black active:bg-white items-center justify-center px-3 py-2 active:text-black text-sm bg-rose-600 hover:bg-rose-700 text-white rounded  active:scale-95 transition-transform"
                        onClick={handleEnroll}
                    >
                      Enroll   <BookPlus className = 'w-4'/>
                    </button>}
                   {Enrolled &&  <label className='text-white  top-0 right-0 w-full flex items-center justify-center absolute bg-rose-600  p-3 text-sm'>Already Enrolled</label>}
                   {Enrolled && !Verify && <button onClick = {handlegotocourse} className='text-white mt-4 bg-black flex items-center justify-center gap-1 active:bg-white active:text-black px-3 py-2 text-xs rounded'><Navigation className='w-4' /> Go To Course </button>}
                  {Verify &&  <button className='text-black mt-4 bg-white gap-1 text-sm border border-black flex active:bg-black active:text-white items-center justify-center px-3 py-2 rounded shadow-lg' onClick={handleEnroll}>Edit <FilePenLine className='w-4' /></button>}
                </div>
            </div>
        </div>
    );
};

export default Card;
