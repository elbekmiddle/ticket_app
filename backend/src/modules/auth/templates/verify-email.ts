export function verifyEmailTemplate(
    name: string,
    otp: string,
) {
    return `
<!DOCTYPE html>
<html>

<head>

<meta charset="utf-8"/>

<style>

body{
background:#f5f7fb;
font-family:Inter,Arial;
padding:40px;
}

.card{
max-width:560px;
margin:auto;
background:white;
border-radius:18px;
padding:40px;
box-shadow:0 10px 40px rgba(0,0,0,.08);
}

.logo{
font-size:24px;
font-weight:700;
}

.title{
margin-top:30px;
font-size:30px;
font-weight:700;
}

.text{
margin-top:18px;
color:#666;
line-height:1.7;
}

.code{
margin:35px 0;
background:#f4f4f4;
border-radius:12px;
font-size:42px;
letter-spacing:10px;
font-weight:700;
text-align:center;
padding:20px;
}

.footer{
margin-top:40px;
font-size:13px;
color:#999;
}

</style>

</head>

<body>

<div class="card">

<div class="logo">
🎫 Ticket App
</div>

<div class="title">
Verify your email
</div>

<div class="text">

Hello <b>${name}</b>

<br><br>

Thanks for signing up.

Enter this code to verify your account.

</div>

<div class="code">

${otp}

</div>

<div class="text">

This code expires in
<b>5 minutes</b>.

</div>

<div class="footer">

If you didn't create this account,
you can safely ignore this email.

</div>

</div>

</body>

</html>
`;
}