import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Card = ({ data }) => {
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

    return (
        <div className="w-80 mb-6  rounded overflow-hidden shadow-lg bg-white">
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
                    <button 
                        className="mt-4 flex gap-2 border active:border-black active:bg-white items-center justify-center px-4 py-2 active:text-black bg-black text-white rounded  active:scale-95 transition-transform"
                        onClick={handleEnroll}
                    >
                        Enroll <Image src = "/Enroll.png" width={20} height={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Card;
