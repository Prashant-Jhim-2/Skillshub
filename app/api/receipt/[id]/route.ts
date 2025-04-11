import { NextRequest,NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(req:NextRequest){
    const pathname = req.nextUrl.pathname; // e.g., '/api/receipt/8fy1OegYFJZ0vDlt4Gh6'
    const id = pathname.split('/').pop();
   
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage();
    const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
    await page.goto(`${baseurl}/Invoice/${id}`, {
        waitUntil: 'networkidle0'
    })
    const pdfbuffeer = await page.pdf({
        format: 'A4',
        printBackground: true,
    })
    await browser.close();
    return new NextResponse(pdfbuffeer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=receipt-${id}.pdf`}
        })
}