import Clientside from './ClientSide'



export default async function Home() {


  // Fetch data server-side
  const res = await fetch(`${process.env.NEXT_PUBLIC_PORT}/Courses`, { cache: 'no-store' });
  const serverData = await res.json();
  

  return (
    <>
     
      <Clientside carddata={serverData.data} />
    </>
  );
}
