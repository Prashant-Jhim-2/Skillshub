import { Resend } from "resend";


export  async function POST(req){
    const body = await req.json()
   console.log(body)
    const email = body.email
    const domain = body.domain
    const Change = body.Change 
    var Details = {}
    if (Change == "Details"){
        Details = body.Details
    }
    const type = body.type 
    var id
    var subject 
    console.log(domain)
    const resend = new Resend(process.env.RESEND_SECRET_KEY)
    
    
    var Html
    console.log(email,domain,type)
    // HTML part for Refund Decline 
    if (type == 'refund'){
        var reason = body.reason
        subject = 'Decline Email for Refund Email'
        
        // HTML Part for Email Verification 
        Html = `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Refund Declination</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 20px;
            }
            .container {
                max-width: 500px;
                background: #fff;
                padding: 20px;
                text-align: center;
                border-radius: 8px;
                box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                margin: auto;
            }
            h2 {
                color: #333;
            }
            p {
                color: #555;
            }
            .button {
                padding: 12px 20px;
                border: 1px solid black;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                display: inline-block;
                margin-top: 10px;
            }
            .footer {
                font-size: 12px;
                color: #777;
                margin-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Your Request for Refund has been declined</h2>
            <p>Reason for Declined</p>
            <p>${reason}</p>
            <div class="footer">
                <p>© 2024 prashantjhim.xyz | All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `
    const response = await resend.emails.send({
        from:'no-reply@prashantjhim.xyz',
        to :email ,
        subject : subject,
        html:Html
    })
    return new Response(JSON.stringify({status:true}))
        }
    
    if (type == 'verify'){
        subject = 'Verification Email'
    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/VerifyInstance`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({Email:email,Change,Details})
        })
    const Res = await Request.json()
    id = Res.id 

    const url = `${domain}/verify/${id}`
    // HTML Part for Email Verification 
    Html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            background: #fff;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            margin: auto;
        }
        h2 {
            color: #333;
        }
        p {
            color: #555;
        }
        .button {
            padding: 12px 20px;
            border: 1px solid black;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            display: inline-block;
            margin-top: 10px;
        }
        .footer {
            font-size: 12px;
            color: #777;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Verify Your Email</h2>
        <p>Click the button below to verify</p>
        <a href=${url} class="button">Verify</a>
        <p>If you didn’t request this, please ignore this email.</p>
        <div class="footer">
            <p>© 2024 prashantjhim.xyz | All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
const response = await resend.emails.send({
    from:'no-reply@prashantjhim.xyz',
    to :email ,
    subject : subject,
    html:Html
})
return new Response(JSON.stringify({status:true}))
    }

  if (type == 'forget'){
    subject = 'Reset Password'
    const RequestforCheck = await fetch(`${process.env.NEXT_PUBLIC_PORT}/CheckEmail`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({Email:email})
    })
    const ResponseforCheck = await RequestforCheck.json()
       console.log(ResponseforCheck)
    if (ResponseforCheck.status == true){

    const Request = await fetch(`${process.env.NEXT_PUBLIC_PORT}/ForgetPassword`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({Email:email})
    })
    const Response = await Request.json()
    if (Response.status == true){
        id = Response.id 
    }
    if (Response.status == false){
        return new Response(JSON.stringify({status:false}))
    }
    const url = `${domain}/forget/${id}`
    // HTML Part for Email Verification 
    Html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            background: #fff;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            margin: auto;
        }
        h2 {
            color: #333;
        }
        p {
            color: #555;
        }
        .button {
            padding: 12px 20px;
            border: 1px solid black;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            display: inline-block;
            margin-top: 10px;
        }
        .footer {
            font-size: 12px;
            color: #777;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your Password</h2>
        <p>Click the button below to Reset Password and Set New Password.</p>
        <a href=${url} class="button">Set New Password</a>
        <p>If you didn’t request this, please ignore this email.</p>
        <div class="footer">
            <p>© 2024 prashantjhim.xyz | All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
const response = await resend.emails.send({
    from:'no-reply@prashantjhim.xyz',
    to :email ,
    subject : subject,
    html:Html
})
 console.log(response)

  }
    return new Response(JSON.stringify({status:ResponseforCheck.status}))
    }


    
   
}

